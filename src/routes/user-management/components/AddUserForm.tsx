import {
  Actions,
  ClientRoles as Roles,
  configs as actionConfigs,
  emailSchema,
} from "@/auto-generated/api-configs";
import Autocomplete from "@/components/common/Autocomplete";
import PhoneInput from "@/components/common/PhoneInput";
import useTranslation from "@/hooks/useTranslation";
import callApi from "@/services/api";
import useMetaDataStore from "@/stores/meta-data.store";
import {
  convertToInternationalFormat,
  isVietnamesePhoneNumber,
  randomPassword,
} from "@/utils";
import {
  Box,
  Button,
  Flex,
  InputLabel,
  PasswordInput,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { isNotEmpty, useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconCopy } from "@tabler/icons-react";
import { useCallback, useState } from "react";
import { z } from "zod";

const { request } = actionConfigs[Actions.ADD_USER].schema;
type Request = z.infer<typeof request>;

type Form = Omit<Request, "departmentIds" | "roleId"> & {
  department: string;
  role: string;
};

const initialValues: Form = {
  department: "",
  role: "",
  userName: "",
  password: "",
  fullName: "",
  email: "",
  phone: "",
};

const w = "100%";

type AddUserFormProps = {
  onSuccess: () => void;
};

const AddUserForm = ({ onSuccess }: AddUserFormProps) => {
  const t = useTranslation();
  const data = useMetaDataStore();
  const [options] = useState({
    departmentIdByName: data.departmentIdByName,
    departments: Array.from(data.departmentIdByName.keys()),
    roles: Array.from(data.roleIdByName.keys()).map((name) =>
      t(`user.role.${name}`),
    ),
    roleIdByName: new Map(
      Array.from(data.roleIdByName.entries())
        .filter(([name]) => name !== Roles.OWNER)
        .map(([name, id]) => [t(`user.role.${name}`), id]),
    ),
  });

  const form = useForm<Form>({
    validate: _validate(t),
    initialValues: {
      ...initialValues,
      password: randomPassword(),
    },
  });

  const submit = useCallback(
    (values: Form) => {
      modals.openConfirmModal({
        title: t("Add user"),
        children: (
          <Text size="sm">
            {t("Are you sure you want to add new user?")}
          </Text>
        ),
        labels: { confirm: "OK", cancel: t("Cancel") },
        onConfirm: async () => {
          const departmentId = values.department
            ? options.departmentIdByName.get(values.department)
            : "";
          const res = await callApi<Request, { id: string }>({
            action: Actions.ADD_USER,
            params: {
              password: Math.random().toString(36).slice(-8),
              userName: values.userName.trim(),
              fullName: values.fullName.trim(),
              departmentIds: [departmentId || ""].filter(Boolean),
              email: values.email?.trim() || undefined,
              phone:
                convertToInternationalFormat(
                  values.phone?.trim() || undefined,
                ) || undefined,
            },
            options: {
              toastMessage: "Add user successfully",
            },
          });
          res?.id && onSuccess();
        },
      });
    },
    [onSuccess, options, t],
  );

  const copyPassword = useCallback(() => {
    navigator.clipboard.writeText(form.values.password);
    notifications.show({
      message: t("Password copied to clipboard"),
    });
  }, [form.values.password, t]);

  return (
    <form
      className="c-catering-form-wrapper"
      onSubmit={form.onSubmit(submit)}
    >
      <TextInput
        w={w}
        withAsterisk
        label={t("Full name")}
        placeholder={t("John Doe")}
        {...form.getInputProps("fullName")}
      />
      <TextInput
        w={w}
        withAsterisk
        label={t("Username")}
        placeholder={t("Username")}
        {...form.getInputProps("userName")}
      />
      <Autocomplete
        w={w}
        withAsterisk
        data={options.roles}
        label={t("Role")}
        {...form.getInputProps("role")}
      />
      <Autocomplete
        w={w}
        label={t("Department")}
        data={options.departments}
        {...form.getInputProps("department")}
      />
      <Box w={w}>
        <Flex w={w} align="end" justify="between" gap={2}>
          <PasswordInput
            w={w}
            disabled
            visible
            label={t("Password")}
            placeholder={t("Password")}
            {...form.getInputProps("password")}
          />
          <UnstyledButton onClick={copyPassword}>
            <IconCopy strokeWidth="1.5" color="black" />
          </UnstyledButton>
        </Flex>
        <Flex w={w} justify="end">
          <InputLabel c={"red.5"}>
            {t(
              "Please copy and keep password safe before create new user",
            )}
          </InputLabel>
        </Flex>
      </Box>
      <TextInput
        w={w}
        label={t("Email")}
        placeholder={t("Email")}
        {...form.getInputProps("email")}
      />
      <PhoneInput
        w={w}
        label={t("Phone")}
        placeholder={t("Phone")}
        onChangeValue={(phone) => form.setFieldValue("phone", phone)}
        {...form.getInputProps("phone")}
      />
      <Button type="submit">{t("Add")}</Button>
    </form>
  );
};

export default AddUserForm;

function _validate(t: (s: string) => string) {
  return {
    userName: isNotEmpty(t("field is required")),
    fullName: isNotEmpty(t("field is required")),
    role: isNotEmpty(t("field is required")),
    phone: (value: unknown) => {
      if (value) {
        if (typeof value !== "string") {
          return t("Invalid phone number");
        }
        if (value && !isVietnamesePhoneNumber(value)) {
          return t("Invalid phone number");
        }
      }
    },
    email: (value: unknown) => {
      if (value) {
        try {
          emailSchema.parse(value);
        } catch (error) {
          return t("Invalid email");
        }
      }
    },
  };
}
