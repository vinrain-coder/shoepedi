"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { SettingInputSchema } from "@/lib/validator";
import { ClientSetting, ISettingInput } from "@/types";
import { updateSetting } from "@/lib/actions/setting.actions";
import useSetting from "@/hooks/use-setting-store";
import PaymentMethodForm from "./payment-method-form";
import DeliveryDateForm from "./delivery-date-form";
import SiteInfoForm from "./site-info-form";
import CommonForm from "./common-form";
import CarouselForm from "./carousel-form";
import AffiliateForm from "./affiliate-form";
import { toast } from "sonner";
import SubmitButton from "@/components/shared/submit-button";
import { Save } from "lucide-react";

const SettingForm = ({ setting }: { setting: ISettingInput }) => {
  const { setSetting } = useSetting();

  const form = useForm<ISettingInput>({
    resolver: zodResolver(SettingInputSchema),
    defaultValues: setting,
  });

  const {
    formState: { isSubmitting },
  } = form;

  async function onSubmit(values: ISettingInput) {
    const res = await updateSetting({ ...values });
    if (!res.success) {
      toast.error(res.message);
    } else {
      toast.success(res.message);
      setSetting(values as ClientSetting);
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-10 pb-20"
        method="post"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <section className="space-y-6">
          <SiteInfoForm id="setting-site-info" form={form} />
          <CommonForm id="setting-common" form={form} />
          <CarouselForm id="setting-carousels" form={form} />
          <PaymentMethodForm id="setting-payment-methods" form={form} />
          <DeliveryDateForm id="setting-delivery-dates" form={form} />
          <AffiliateForm id="setting-affiliate" form={form} />
        </section>

        <div className="fixed bottom-6 right-6 z-50 md:right-10 lg:right-16">
          <SubmitButton
            type="submit"
            isLoading={isSubmitting}
            loadingText="Saving..."
            className="h-14 rounded-full px-8 shadow-2xl hover:scale-105 transition-transform"
            size="lg"
          >
            <Save className="mr-2 h-5 w-5" />
            Save Configuration
          </SubmitButton>
        </div>
      </form>
    </Form>
  );
};

export default SettingForm;
