import * as React from "react";
import {
    useFormContext,
    FormProvider,
    Controller,
    type UseFormReturn,
} from "react-hook-form";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

const Form = FormProvider;

interface FormFieldContextValue {
    name: string;
}

const FormFieldContext = React.createContext<FormFieldContextValue | null>(
    null
);

interface FormFieldProps<T extends Record<string, any>> {
    name: keyof T;
    control: UseFormReturn<T>["control"];
    render: (props: {
        field: any;
        fieldState: any;
        formState: any;
    }) => React.ReactElement;
}

function FormField<T extends Record<string, any>>({
    name,
    control,
    render,
}: FormFieldProps<T>) {
    return (
        <FormFieldContext.Provider value={{ name: name as string }}>
            <Controller
                name={name as any}
                control={control}
                render={(props) => render(props)}
            />
        </FormFieldContext.Provider>
    );
}

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.ComponentProps<typeof Label>
>(({ className, ...props }, ref) => {
    return <Label ref={ref} className={className} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("", className)} {...props} />;
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    return (
        <p
            ref={ref}
            className={cn("text-[0.8rem] text-muted-foreground", className)}
            {...props}
        />
    );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    const { name } = React.useContext(FormFieldContext) || {};
    const form = useFormContext();
    const error = name ? (form.formState.errors as any)[name] : null;

    if (!error) return null;

    return (
        <p
            ref={ref}
            className={cn(
                "text-[0.8rem] font-medium text-destructive",
                className
            )}
            {...props}
        >
            {error?.message as string}
        </p>
    );
});
FormMessage.displayName = "FormMessage";

export {
    Form,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
    FormField,
};
