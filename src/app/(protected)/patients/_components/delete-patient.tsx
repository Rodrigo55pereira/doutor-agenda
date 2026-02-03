import { TrashIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { toast } from 'sonner';

import { deletePatient } from '@/actions/delete-patient';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { patientsTable } from '@/db/schema';

type DeletePatientProps = {
  patient: typeof patientsTable.$inferSelect;
  onSuccess?: () => void;
};

const DeletePatient = ({ patient, onSuccess }: DeletePatientProps) => {
  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      toast.success('Paciente deletado com sucesso!');
      onSuccess?.();
    },
    onError: () => {
      toast.error('Erro ao deletar o paciente');
    },
  });

  const handleDeletePatientClick = () => {
    if (!patient) return;
    deletePatientAction.execute({ id: patient.id });
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="w-full" variant="outline">
          <TrashIcon />
          Deletar Paciente
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Tem certeza que deseja deletar esse paciente?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Essa ação não pode ser revertida. Isso irá deletar o paciente e todas as
            consultas agendadas.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeletePatientClick}>
            Deletar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
export default DeletePatient;
