"""Backend API tests for Basket Scout Sheet Pro."""
import os
import time
import json
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://court-scout-pro.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


# --- Health ---
def test_root(session):
    r = session.get(f"{API}/")
    assert r.status_code == 200
    assert "message" in r.json()


# --- Matches CRUD ---
def test_list_matches(session):
    r = session.get(f"{API}/matches")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.fixture(scope="module")
def created_match(session):
    payload = {
        "my_team": "TEST_Olimpia",
        "opponent_team": "TEST_Virtus",
        "venue": "casa",
        "date": "2026-01-15",
        "time": "20:30",
        "location": "PalaTest",
        "quarter": "Q1",
        "players": [
            {"id": f"p{i}", "number": i, "name": f"N{i}", "surname": f"S{i}",
             "inCampo": i <= 5, "shots": [], "fts": [],
             "stats": {"pf": 0, "ro": 0, "rd": 0, "to": 0, "stl": 0, "ast": 0, "blk": 0, "df": 0, "pmAdj": 0}}
            for i in range(1, 21)
        ],
        "opponent_events": [],
    }
    r = session.post(f"{API}/matches", json=payload)
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get("id")
    assert data["my_team"] == "TEST_Olimpia"
    yield data
    session.delete(f"{API}/matches/{data['id']}")


def test_get_match(session, created_match):
    r = session.get(f"{API}/matches/{created_match['id']}")
    assert r.status_code == 200
    d = r.json()
    assert d["my_team"] == "TEST_Olimpia"
    assert len(d["players"]) == 20


def test_update_match(session, created_match):
    mid = created_match["id"]
    payload = {**created_match, "my_team": "TEST_Updated", "venue": "trasferta"}
    payload.pop("id", None); payload.pop("ai_analysis", None); payload.pop("created_at", None); payload.pop("updated_at", None)
    # Simulate a made 3-point shot by first player (in campo)
    payload["players"][0]["shots"] = [{
        "id": "s1", "x": 10, "y": 10, "result": "made", "is3Point": True,
        "quarter": "Q1", "onCourt": [f"p{i}" for i in range(1, 6)]
    }]
    r = session.put(f"{API}/matches/{mid}", json=payload)
    assert r.status_code == 200
    # Verify persistence via list endpoint scores
    r2 = session.get(f"{API}/matches")
    assert r2.status_code == 200
    rec = next((x for x in r2.json() if x["id"] == mid), None)
    assert rec is not None
    assert rec["my_team"] == "TEST_Updated"
    assert rec["our_score"] == 3
    assert rec["venue"] == "trasferta"


def test_get_404(session):
    r = session.get(f"{API}/matches/507f1f77bcf86cd799439011")
    assert r.status_code == 404
    r2 = session.get(f"{API}/matches/not-an-oid")
    assert r2.status_code == 404


# --- Rosters ---
@pytest.fixture(scope="module")
def created_roster(session):
    payload = {"name": "TEST_Roster1", "players": [{"number": 7, "name": "Mario", "surname": "Rossi"}]}
    r = session.post(f"{API}/rosters", json=payload)
    assert r.status_code == 200
    data = r.json()
    assert data.get("id")
    assert data["name"] == "TEST_Roster1"
    yield data
    session.delete(f"{API}/rosters/{data['id']}")


def test_list_rosters(session, created_roster):
    r = session.get(f"{API}/rosters")
    assert r.status_code == 200
    names = [x["name"] for x in r.json()]
    assert "TEST_Roster1" in names


def test_delete_roster(session):
    payload = {"name": "TEST_DelRoster", "players": []}
    r = session.post(f"{API}/rosters", json=payload)
    rid = r.json()["id"]
    r2 = session.delete(f"{API}/rosters/{rid}")
    assert r2.status_code == 200


# --- AI analysis (SSE) ---
def test_ai_analysis_stream(session, created_match):
    mid = created_match["id"]
    with session.post(f"{API}/matches/{mid}/analysis", stream=True, timeout=90) as r:
        assert r.status_code == 200
        got_text = ""
        done = False
        start = time.time()
        for line in r.iter_lines(decode_unicode=True):
            if not line:
                continue
            if line.startswith("data: "):
                payload = line[6:]
                if payload == "[DONE]":
                    done = True
                    break
                try:
                    obj = json.loads(payload)
                    if "t" in obj:
                        got_text += obj["t"]
                    if "error" in obj:
                        pytest.fail(f"AI error: {obj['error']}")
                except json.JSONDecodeError:
                    pass
            if time.time() - start > 80:
                break
        assert done, "SSE did not complete"
        assert len(got_text) > 50, f"AI content too short: {got_text!r}"
    # Verify persisted
    r2 = session.get(f"{API}/matches/{mid}")
    assert r2.status_code == 200
    assert len(r2.json().get("ai_analysis", "")) > 50
