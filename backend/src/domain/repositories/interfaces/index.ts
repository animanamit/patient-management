export {
  IPatientRepository,
  RepositoryResult,
  RepositoryError,
} from "./patient-repository";
export { IAppointmentRepository } from "./appointment-repository";
export { IDoctorRepository } from "./doctor-repository";
export type { PatientFilters, PatientUpdateData } from "./patient-repository";
export type {
  AppointmentFilters,
  AppointmentUpdateData,
} from "./appointment-repository";
export type { DoctorFilters, DoctorUpdateData } from "./doctor-repository";
