"use client";

import BasicInfoFields from "./sections/basic-info-fields";
import ContactFields from "./sections/contact-fields";
import DateFields from "./sections/date-fields";
import FormActions from "./sections/form-actions";

type Props = {
  /** Called when the user clicks the Reset button */
  onResetAction: () => Promise<void>;
  isResetting?: boolean;
};

export default function ApplicationForm({ onResetAction, isResetting = false }: Props) {
  // Purely presentational: only composes sections, no hooks here.
  return (
    <>
      <BasicInfoFields />
      <ContactFields />
      <DateFields />
      <FormActions onResetAction={onResetAction} isResetting={isResetting} />
    </>
  );
}
