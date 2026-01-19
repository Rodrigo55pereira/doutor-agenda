import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),

});

export const usersToClinicsTable = pgTable("users_to_clinics", {
    userId: uuid("user_id").notNull().references(() => usersTable.id),
    clinicId: uuid("clinic_id").notNull().references(() => clinicsTable.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updateAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const clinicsTable = pgTable("clinics", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updateAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const doctorsTable = pgTable("doctors", {
    id: uuid("id").defaultRandom().primaryKey(),

    // {onDelete: "cascade"} => deleta em cascata se eu deletar uma clinica.
    clinicId: uuid("clinic_id").notNull().references(() => clinicsTable.id, {onDelete: "cascade"}),  

    name: text("name").notNull(),
    avatarImageUrl: text("avatar_image_url"),


    // 0 - domingo, 1 - segunda, 2 - terça, 3 - quarta, 4 - quinta, 5 - sexta, 6 - sábado
    availableFromWeekDay: integer("available_from_week_day").notNull(),
    availableToWeekDay: integer("available_to_week_day").notNull(),
    availableFromtime: time("available_from_time").notNull(),
    availableToTime: time("available_to_time").notNull(),

    appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),

    specialty: text("specialty").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updateAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id").notNull().references(() => clinicsTable.id, {onDelete: "cascade"}),

    name: text("name").notNull(),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    sex: patientSexEnum("sex").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const appointmentsTable = pgTable("appointments", {
    id: uuid("id").defaultRandom().primaryKey(),
    date: timestamp("date").notNull(),

    clinicId : uuid("clinic_id").notNull().references(() => clinicsTable.id, {onDelete: "cascade"}),
    patientId: uuid("patient_id").notNull().references(() => patientsTable.id, {onDelete: "cascade"}),
    doctorId: uuid("doctor_id").notNull().references(() => doctorsTable.id, {onDelete: "cascade"}),
});


// Cardinalidades e relacionamentos

// Aqui estamos dizendo que uma clínica pode ter vários médicos, pacientes e agendamentos.
// Ou seja, existe uma relação "um para muitos" entre clínica e esses outros registros.

// USUARIO
export const usersTableRelations = relations(usersTable, ({ many }) => ({
    // Um usuário pode estar vinculado a várias clínicas e uma clínica pode ter vários usuários (N usuários : N clínicas)
    usersToClinics: many(usersToClinicsTable),
}));

// CLINICA
export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
    doctors: many(doctorsTable),      // 1 clínica : N médicos (um para muitos)
    patients: many(patientsTable),    // 1 clínica : N pacientes (um para muitos)
    appointments: many(appointmentsTable), // 1 clínica : N agendamentos (um para muitos)
    usersToClinics: many(usersToClinicsTable), // 1 clínica : N usuários (um para muitos, uma clínica pode ter vários usuários vinculados a ela)
}));

// USUARIO/CLINICA
export const usersToClinicsTableRelations = relations(usersToClinicsTable, ({ one }) => ({
    user: one(usersTable, {
        fields: [usersToClinicsTable.userId],
        references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
        fields: [usersToClinicsTable.clinicId],
        references: [clinicsTable.id],
    })
}));

// DOUTOR
export const doctorsTableRelations = relations(doctorsTable, ({ one, many }) => ({
    // Aqui estamos dizendo que cada médico está ligado a uma única clínica.
    // Ou seja, para cada registro de médico, associamos ele a uma clínica usando o campo clinicId.
    
    // Um médico pertence a uma única clínica (N médicos : 1 clínica)
    clinic: one(clinicsTable, {
        fields: [doctorsTable.clinicId], // Aponta quais campos tem vinculo.
        references: [clinicsTable.id],
    }),
    // Um médico pode ter vários agendamentos (ou seja, 1 médico : N agendamentos).
    // Isso significa que um mesmo médico atende diversos agendamentos ao longo do tempo.
    appointments: many(appointmentsTable)
}));


// PACIENTE
export const patientsTableRelations = relations(patientsTable, ({ one, many }) => ({
    // Um paciente pertence a uma única clínica (N pacientes : 1 clínica)
    clinic: one(clinicsTable, {
        fields: [patientsTable.clinicId],
        references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
}));

// AGENDAMENTO
export const appointmentsTableRelations = relations(appointmentsTable, ({ one }) => ({
    // Um agendamento pertence a uma única clínica (N agendamentos : 1 clínica)
    clinic: one(clinicsTable, {
        fields: [appointmentsTable.clinicId],
        references: [clinicsTable.id],
    }),
    // Um agendamento pertence a um único paciente (N agendamentos : 1 paciente)
    patient: one(patientsTable, {
        fields: [appointmentsTable.patientId],
        references: [patientsTable.id],
    }),
    // Um agendamento pertence a um único médico (N agendamentos : 1 médico)
    doctor: one(doctorsTable, {
        fields: [appointmentsTable.doctorId],
        references: [doctorsTable.id],
    }),
}));

