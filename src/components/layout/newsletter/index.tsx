"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { useForm } from "react-hook-form";
import { RecoverPasswordFormState } from "@components/customer/types";
import { Button } from "@components/common/button/LoadingButton";
import { userSubscribe } from "@utils/actions";
import { useCustomToast } from "@utils/hooks/useToast";
import { EMAIL_REGEX } from "@utils/constants";

type FormValues = {
    email: string;
};

const NewsletterSection = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<FormValues>({ mode: "onSubmit" });
    const { showToast } = useCustomToast();

    const [status, setStatus] = useState<RecoverPasswordFormState["errors"] | null>(null);

    const onSubmit = async (data: FormValues) => {
        setStatus(null);
        const formData = new FormData();
        formData.append("email", data.email);
        setLoading(true);

        try {
            const result = await userSubscribe(undefined as any, formData);
            setStatus(result?.errors || null);
            if (result?.errors?.apiRes?.status) {
                reset();
            }
        } catch (error) {
            console.error("Subscription failed:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (status) {
            setTimeout(() => {
                setStatus(null);
            }, 3500);
        }
        if (status?.email) {
            showToast(status?.email[0], "warning");
        }
        if (status?.apiRes?.status === false) {
            showToast(status?.apiRes?.msg, "warning");
        }
        if (status?.apiRes?.status === true) {
            showToast("Successfully Subscribed", "success");
        }
    }, [status]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <section className="relative z-0 bg-white dark:bg-background py-16 md:py-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-5xl mx-auto">
                <div className="bg-neutral-50 dark:bg-neutral-900 rounded-[2.5rem] p-8 md:p-16 text-center border border-neutral-100 dark:border-neutral-800 shadow-sm relative overflow-hidden transition-colors duration-300">

                    {/* Decorative background blur element */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none transition-colors duration-300"></div>
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-rose-100/50 dark:bg-rose-900/20 rounded-full blur-3xl pointer-events-none transition-colors duration-300"></div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 dark:text-white mb-4 font-outfit transition-colors duration-300">
                            Join our newsletter
                        </h2>
                        <p className="text-base md:text-lg text-neutral-600 dark:text-neutral-400 mb-10 max-w-2xl mx-auto transition-colors duration-300">
                            Stay updated with our latest collections, exclusive offers, and fashion insights delivered straight to your inbox.
                        </p>

                        <form
                            noValidate
                            className="relative max-w-md mx-auto"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-neutral-400 dark:text-neutral-500 transition-colors duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect width="20" height="16" x="2" y="4" rx="2" />
                                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                                        </svg>
                                    </div>
                                    <input
                                        type="email"
                                        aria-label="Email Address"
                                        {...register("email", {
                                            required: "Email is required",
                                            pattern: {
                                                value: EMAIL_REGEX,
                                                message: "Enter a valid email",
                                            },
                                        })}
                                        className={clsx(
                                            "block w-full rounded-full pl-11 pr-4 py-3.5 text-sm transition-all duration-300",
                                            "bg-white dark:bg-transparent text-neutral-900 dark:text-white",
                                            "border focus:outline-none focus:ring-2",
                                            errors.email || status?.email
                                                ? "border-red-500 dark:border-red-500/80 focus:ring-red-500 focus:border-red-500"
                                                : "border-neutral-200 dark:border-neutral-800 focus:ring-neutral-900 dark:focus:ring-neutral-100 focus:border-neutral-900 dark:focus:border-neutral-100",
                                            "placeholder:text-neutral-500 dark:placeholder:text-neutral-500"
                                        )}
                                        placeholder="Enter your email address"
                                    />
                                    {errors.email && (
                                        <p className="absolute -bottom-6 left-4 text-xs font-medium text-red-600 dark:text-red-400 transition-colors duration-300">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <Button
                                    className={clsx(
                                        "flex-shrink-0 w-full sm:w-auto !rounded-full px-8 py-3.5 text-sm font-medium transition-all duration-300",
                                        "bg-black dark:!bg-white text-white dark:!text-black hover:bg-neutral-800 dark:hover:!bg-neutral-200",
                                        "border border-transparent",
                                        {
                                            "opacity-50 cursor-not-allowed": isSubmitting || loading,
                                        }
                                    )}
                                    disabled={loading || isSubmitting}
                                    loading={loading || isSubmitting}
                                    title="Subscribe"
                                    type="submit"
                                />
                            </div>
                        </form>

                        <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-500 transition-colors duration-300">
                            By subscribing, you agree to our Privacy Policy and consent to receive updates.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
