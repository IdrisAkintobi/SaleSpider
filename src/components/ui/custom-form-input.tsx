import { ChangeEvent } from "react";
import { Controller, type Control, type UseFormRegister } from "react-hook-form";
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
  control?: Control<any>;
  register?: UseFormRegister<any>;
  error?: string;
  placeholder?: string;
  step?: string | number;
  options?: string[]; // Add options prop for select
  onChange?: (value: string) => void;
  disabled?: boolean;
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
  disabled,
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
          disabled={disabled}
          value={field.value ?? ""}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
          onChange={
            onChange
              ? (e: ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  // Call custom onChange with the raw value
                  onChange(value);
                }
              : (e: ChangeEvent<HTMLInputElement>) => {
                  const value = e.target.value;
                  // For number inputs, convert to number, otherwise keep as string
                  if (type === "number") {
                    field.onChange(value === "" ? "" : Number(value));
                  } else {
                    field.onChange(value);
                  }
                }
          }
        />
      )}
    />
  );

  const renderRegularInput = () => (
    <Input
      id={name}
      {...(register ? register(name) : {})}
      type={type}
      step={step}
      placeholder={placeholder}
      disabled={disabled}
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
