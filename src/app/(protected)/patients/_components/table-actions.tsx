import { EditIcon, MoreVerticalIcon, TrashIcon } from 'lucide-react';
import { useAction } from 'next-safe-action/hooks';
import { useState } from 'react';
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
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { patientsTable } from '@/db/schema';

import UpsertPatientForm from './upsert-patient-form';

interface PatientsTableActionsProps {
  patient: typeof patientsTable.$inferSelect;
}

const PatientsTableActions = ({ patient }: PatientsTableActionsProps) => {
  const [upsertDialogIsOpen, setUpsertDialogIsOpen] = useState(false);
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [dropdownIsOpen, setDropdownIsOpen] = useState(false);

  const deletePatientAction = useAction(deletePatient, {
    onSuccess: () => {
      toast.success('Paciente deletado com sucesso!');
      setDeleteDialogIsOpen(false);
      setDropdownIsOpen(false);
    },
    onError: () => {
      toast.error('Erro ao deletar o paciente');
    },
  });

  const handleDeletePatientClick = () => {
    deletePatientAction.execute({ id: patient.id });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogIsOpen(false);
    setDropdownIsOpen(false);
  };

  return (
    <Dialog open={upsertDialogIsOpen} onOpenChange={setUpsertDialogIsOpen}>
      <DropdownMenu open={dropdownIsOpen} onOpenChange={setDropdownIsOpen}>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon">
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{patient.name}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setUpsertDialogIsOpen(true);
              setDropdownIsOpen(false);
            }}
          >
            <EditIcon />
            Editar
          </DropdownMenuItem>
          <AlertDialog open={deleteDialogIsOpen} onOpenChange={setDeleteDialogIsOpen}>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <TrashIcon color="red" />
                Deletar
              </DropdownMenuItem>
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
                <AlertDialogCancel onClick={handleCloseDeleteDialog}>
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction onClick={handleDeletePatientClick}>
                  Deletar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
      <UpsertPatientForm
        isOpen={upsertDialogIsOpen}
        patient={patient}
        onSuccess={() => setUpsertDialogIsOpen(false)}
      />
    </Dialog>
  );
};
export default PatientsTableActions;
