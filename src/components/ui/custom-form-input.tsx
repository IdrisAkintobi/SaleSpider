import { ChangeEvent } from "react";
import { Controller } from "react-hook-form";
import { FormField } from "./custom-form-field";
import { Input } from "./input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

interface FormInputProps {
  label: string;
  name: string;
  type?: "text" | "number" | "url" | "select";
  control?: any;
  register?: any;
  error?: string;
  placeholder?: string;
  step?: string | number;
  options?: string[]; // Add options prop for select
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
  options,
  onChange,
}: FormInputProps) => {
  const renderSelectField = () => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger>
            <SelectValue placeholder={placeholder ?? "Select an option"} />
          </SelectTrigger>
          <SelectContent>
            {options?.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  );

  const renderControlledInput = () => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Input
          id={name}
          type={type}
          step={step}
          placeholder={placeholder}
          {...field}
          onChange={
            onChange
              ? (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
              : field.onChange
          }
        />
      )}
    />
  );

  const renderRegularInput = () => (
    <Input
      id={name}
      {...register(name)}
      type={type}
      step={step}
      placeholder={placeholder}
    />
  );

  const renderInputField = () => {
    if (type === "select") {
      return renderSelectField();
    }
    if (control) {
      return renderControlledInput();
    }
    return renderRegularInput();
  };

  return (
    <FormField label={label} error={error}>
      {renderInputField()}
    </FormField>
  );
};
