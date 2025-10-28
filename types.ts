
export enum View {
  Home,
  Register,
  Submit,
}

export interface RegistrationFormData {
  name: string;
  phone: string;
  email: string;
  schoolName: string;
  city: string;
  logo: {
    filename: string;
    mimeType: string;
    data: string;
  } | null;
}

export interface SubmissionFormData {
  referenceId: string;
  machineIds: string[];
}
