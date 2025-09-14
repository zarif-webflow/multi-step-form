import { getGsap, getMultipleHtmlElements } from "@taj-wf/utils";

const inputSelector = [
  'input[type="text"]',
  'input[type="email"]',
  'input[type="password"]',
  'input[type="number"]',
  'input[type="tel"]',
  'input[type="url"]',
  'input[type="date"]',
  'input[type="datetime-local"]',
  'input[type="time"]',
  'input[type="month"]',
  'input[type="week"]',
  'input[type="search"]',
  'input[type="color"]',
  'input[type="range"]',
  'input[type="file"]',
  'input[type="hidden"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'input[type="button"]',
  'input[type="reset"]',
  "input:not([type])", // Default input without type attribute
  "select",
  "textarea",
].join(", ");

const getAllInputElements = (parentElement: HTMLElement) => {
  // Comprehensive CSS selector for all input elements

  const allInputs = getMultipleHtmlElements<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >({
    selector: inputSelector,
    parent: parentElement,
    log: "error",
  });

  return allInputs || [];
};

const initMultiStepForm = () => {
  const [gsap] = getGsap();

  if (!gsap) return;

  const multiStepForms = getMultipleHtmlElements<HTMLFormElement>({
    selector: "form[ms-form=true]",
    log: "error",
  });

  if (!multiStepForms) return;

  for (const form of multiStepForms) {
    const steps = getMultipleHtmlElements<HTMLDivElement>({
      selector: "[ms-step=true]",
      parent: form,
      log: "error",
    });

    if (!steps) continue;

    const stepsCount = steps.length;

    if (stepsCount < 2) {
      console.error("Multi-step form requires at least 2 steps.", form);
      continue;
    }

    const allNextButtons = getMultipleHtmlElements({
      selector: "[ms-next=true]",
      parent: form,
      log: "error",
    });

    const allPrevButtons = getMultipleHtmlElements({
      selector: "[ms-prev=true]",
      parent: form,
      log: "error",
    });

    if (!allNextButtons || !allPrevButtons) continue;

    const lastStepIndex = stepsCount - 1;
    let currentStep = 0;

    const goNextStep = async () => {
      if (currentStep >= lastStepIndex) return;

      const currentStepElement = steps[currentStep];
      const nextStepElement = steps[currentStep + 1];

      //   Input Validation Start
      const currentStepInputs = getAllInputElements(currentStepElement);

      for (const inputEl of currentStepInputs) {
        if (inputEl.checkValidity()) continue;
        inputEl.reportValidity();
        return;
      }

      // Animation Start
      await gsap.to(currentStepElement, { xPercent: -102, opacity: 0, duration: 0.4 }).then();

      currentStepElement.classList.add("is--hidden");

      gsap.set(nextStepElement, { xPercent: 102, opacity: 0 });

      nextStepElement.classList.remove("is--hidden");

      await gsap.to(nextStepElement, { xPercent: 0, opacity: 1, duration: 0.4 });
      //   Animation End

      currentStep += 1;
    };

    const goPrevStep = async () => {
      if (currentStep <= 0) return;

      const currentStepElement = steps[currentStep];
      const prevStepElement = steps[currentStep - 1];

      //   Animation Start
      await gsap.to(currentStepElement, { xPercent: 102, opacity: 0, duration: 0.4 }).then();

      currentStepElement.classList.add("is--hidden");

      gsap.set(prevStepElement, { xPercent: -102, opacity: 0 });

      prevStepElement.classList.remove("is--hidden");

      await gsap.to(prevStepElement, { xPercent: 0, opacity: 1, duration: 0.4 });
      //   Animation End

      currentStep -= 1;
    };

    for (const nextBtn of allNextButtons) {
      nextBtn.setAttribute("type", "button");
      nextBtn.addEventListener("click", () => {
        goNextStep();
      });
    }

    for (const prevBtn of allPrevButtons) {
      prevBtn.setAttribute("type", "button");
      prevBtn.addEventListener("click", () => {
        goPrevStep();
      });
    }
  }
};

initMultiStepForm();
