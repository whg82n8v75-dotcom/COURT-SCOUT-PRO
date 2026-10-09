import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const ConfirmButton = ({ title, description, onConfirm, children, className, testId }) => (
  <AlertDialog>
    <AlertDialogTrigger asChild>
      <button data-testid={testId} className={className}>{children}</button>
    </AlertDialogTrigger>
    <AlertDialogContent className="bg-slate-900 border-white/10">
      <AlertDialogHeader>
        <AlertDialogTitle className="font-display text-2xl uppercase">{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel data-testid={`${testId}-cancel`}>Annulla</AlertDialogCancel>
        <AlertDialogAction data-testid={`${testId}-confirm`} onClick={onConfirm} className="bg-red-600 hover:bg-red-500">Conferma</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);
