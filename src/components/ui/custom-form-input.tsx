import { Controller } from "react-hook-form";
import { FormField } from "./custom-form-field";
import { Input } from "./input";

interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "number" | "url";
  control?: any; // `control` prop for Controller usage
  register?: any; // `register` prop for simple input fields
  error?: string;
  placeholder?: string;
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
              placeholder={placeholder}
              {...field}
              onChange={
                onChange ? (e) => onChange(e.target.value) : field.onChange
              }
            />
          )}
        />
      ) : (
        <Input
          id={name}
          {...register(name)}
          type={type}
          placeholder={placeholder}
        />
      )}
    </FormField>
  );
};
