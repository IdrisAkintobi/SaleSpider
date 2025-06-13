import { ChangeEvent } from "react";
import { Controller } from "react-hook-form";
import { FormField } from "./custom-form-field";
import { Input } from "./input";

interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "number" | "url";
  control?: any;
  register?: any;
  error?: string;
  placeholder?: string;
  step?: string | number;
  onChange?: (value: any) => void;
}

export const FormInput = ({
  label,
  name,
  type = "text",
  control,
  register,
  error,
  placeholder,
  step,
  onChange,
}: FormInputProps) => {
  return (
    <FormField label={label} error={error}>
      {control ? (
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              id={name}
              type={type}
              step={step} // Pass step to Input
              placeholder={placeholder}
              {...field}
              onChange={
                onChange
                  ? (e: ChangeEvent<HTMLInputElement>) =>
                      onChange(e.target.value)
                  : field.onChange
              }
            />
          )}
        />
      ) : (
        <Input
          id={name}
          {...register(name)}
          type={type}
          step={step} // Pass step to Input
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
};
