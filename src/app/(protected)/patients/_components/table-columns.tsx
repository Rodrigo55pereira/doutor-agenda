'use client';

import { ColumnDef } from '@tanstack/react-table';

import { patientsTable } from '@/db/schema';

import PatientsTableActions from './table-actions';

type PatientTableColumns = typeof patientsTable.$inferSelect;

export const patientTableColumns: ColumnDef<PatientTableColumns>[] = [
  {
    id: 'name',
    accessorKey: 'name',
    header: 'Nome',
  },
  {
    id: 'email',
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'phoneNumber',
    header: 'Telefone',
  },
  {
    id: 'sex',
    accessorKey: 'sex',
    header: 'Sexo',
    cell: (params) => {
      const patient = params.row.original;
      return patient.sex === 'male' ? 'Masculino' : 'Feminino';
    },
  },
  {
    id: 'actions',
    cell: (params) => {
      const patient = params.row.original;
      return <PatientsTableActions patient={patient} />;
    },
  },
];
