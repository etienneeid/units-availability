export interface IAlternative {
  id: number;
  availableStarting: string;
}

export interface IPropertyAvailabilityCheckResult {
  match: number[] | [];
  alternative: IAlternative[] | [];
  other: number[] | [];
}
