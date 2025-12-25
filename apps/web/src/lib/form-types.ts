import type { FormApi, ReactFormApi } from "@tanstack/react-form";
import type { SiteFormValues } from "@/components/features/panel/sites/common/site-form";

/**
 * Helper type for form instances created with useForm
 *
 * This provides a balance between type safety and flexibility:
 * - TFormData is strongly typed for field names and values
 * - Validator types use `any` to allow flexibility with different validation configurations
 *
 * Usage:
 * ```ts
 * interface MyFormProps {
 *   form: FormInstance<MyFormValues>;
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FormInstance<TFormData> = FormApi<
  TFormData,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any,
  any
> &
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ReactFormApi<
    TFormData,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;

// Specific form types for the app
export type SiteFormType = FormInstance<SiteFormValues>;
