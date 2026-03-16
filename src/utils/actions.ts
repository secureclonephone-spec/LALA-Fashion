"use server";
import { redirect } from "next/navigation";
import {
  createUserToLogin,
  logoutUser,
  recoverUserLogin,
} from '@/utils/bagisto';
import { isObject } from "@utils/type-guards";
import { RegisterInputs } from "@components/customer/RegistrationForm";
import { RecoverPasswordFormState } from "@components/customer/types";
import { createClient } from "@/utils/supabase/server";

export type RegisterFormState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    password?: string[];
    passwordConfirmation?: string[];
    apiError?: string;
    agreement?: string[];
  };
};

export async function redirectToCheckout(formData: FormData) {
  const url = formData.get("url") as string;
  redirect(url);
}


export async function createUser(formData: RegisterInputs) {
  try {
    const { firstName, lastName, email, password, passwordConfirmation } =
      formData;

    const user = await createUserToLogin({
      firstName,
      lastName,
      email,
      password,
      passwordConfirmation,
    });

    return {
      error: {},
      success: true,
      customer: user,
    };
  } catch (err: any) {
    return {
      error: { message: err?.message || "An error occurred" },
      success: false,
      customer: {},
    };
  }
}


export async function recoverPassword(formData: {
  email: string;
}): Promise<RecoverPasswordFormState> {

  const result = await recoverUserLogin({ email: formData.email }) as any;

  if (isObject(result?.error)) {
    const error = result.error as Record<string, unknown>;
    return {
      errors: {
        apiRes: {
          status: false,
          msg: (error?.message as string) ?? "Something went wrong",
        },
      },
    };
  }

  const body = result?.body;
  const createForgotPassword = body?.data?.createForgotPassword;
  const forgotPassword = createForgotPassword?.forgotPassword;

  return {
    success: {
      status: forgotPassword?.success ?? false,
      msg: "Recovery email sent successfully.",
    },
  };
}




export async function userSubscribe(
  _prevState: RecoverPasswordFormState,
  formData: FormData
): Promise<RecoverPasswordFormState> {
  const emailRaw = formData.get("email");
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return {
      errors: {
        email: ["Please enter a valid email address."],
      },
    };
  }

  try {
    const supabase = await createClient();

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('newsletter_subscribers')
      .select('id, status')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      if (existing.status?.toUpperCase() === 'ACTIVE') {
        return {
          errors: {
            apiRes: {
              status: false,
              msg: "This email is already subscribed to our newsletter.",
            },
          },
        };
      }
      // Re-subscribe if previously unsubscribed
      const { error } = await supabase
        .from('newsletter_subscribers')
        .update({ status: 'ACTIVE' })
        .eq('id', existing.id);

      if (error) throw new Error(error.message);

      return {
        errors: {
          apiRes: {
            status: true,
            msg: "Welcome back! You have been re-subscribed successfully.",
          },
        },
      };
    }

    // New subscriber
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert([{ email, status: 'ACTIVE' }]);

    if (error) throw new Error(error.message);

    return {
      errors: {
        apiRes: {
          status: true,
          msg: "You have successfully subscribed to our newsletter!",
        },
      },
    };
  } catch (err: any) {
    return {
      errors: {
        apiRes: {
          status: false,
          msg: err?.message || "An unexpected error occurred. Please try again.",
        },
      },
    };
  }
}


export async function logoutAction() {
  return await logoutUser();
}