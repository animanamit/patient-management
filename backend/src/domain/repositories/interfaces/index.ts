export {
  IPatientRepository,
  RepositoryResult,
  RepositoryError,
} from "./patient-repository.js";
export { IAppointmentRepository } from "./appointment-repository.js";
export { IDoctorRepository } from "./doctor-repository.js";
export type { PatientFilters, PatientUpdateData } from "./patient-repository.js";
export type {
  AppointmentFilters,
  AppointmentUpdateData,
} from "./appointment-repository.js";
export type { DoctorFilters, DoctorUpdateData } from "./doctor-repository.js";
