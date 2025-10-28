import { useCallback, useState } from "react";

export function useRequiredHighlight() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitCheck = useCallback((formElement) => {
    setSubmitted(true);

    const requiredControls = formElement.querySelectorAll(
      "input[required], textarea[required], select[required]"
    );

    let valid = true;

    requiredControls.forEach((control) => {
      const value = (control.value || "").trim();
      if (!value) {
        control.classList.add("border-red-500", "ring-1", "ring-red-500");
        valid = false;
      } else {
        control.classList.remove("border-red-500", "ring-1", "ring-red-500");
      }
    });

    return valid; // return false to stop form submission
  }, []);

  const clearOnInput = useCallback((e) => {
    const el = e.target;
    if (submitted && el.hasAttribute("required")) {
      if ((el.value || "").trim()) {
        el.classList.remove("border-red-500", "ring-1", "ring-red-500");
      }
    }
  }, [submitted]);

  return { handleSubmitCheck, clearOnInput };
}
