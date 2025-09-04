"use client";

import BasicInfoFields from "./sections/basic-info-fields";
import ContactFields from "./sections/contact-fields";
import DateFields from "./sections/date-fields";
import FormActions from "./sections/form-actions";

type Props = {
  /** Called when the user clicks the Reset button */
  onResetAction: () => Promise<void>;
  isResetting?: boolean;
  /** 'create' on the create page, 'edit' on the edit page */
  mode: "create" | "edit";
};

export default function ApplicationForm({ onResetAction, isResetting = false, mode }: Props) {
  // purely presentational
  return (
    <>
      <BasicInfoFields />
      <ContactFields />
      <DateFields />
      <FormActions mode={mode} onResetAction={onResetAction} isResetting={isResetting} />
    </>
  );
}
