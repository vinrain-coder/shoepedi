/* eslint-disable @next/next/no-img-element */
import { AutoResizeTextarea } from "@/components/shared/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { UploadButton } from "@/lib/uploadthing";
import { ISettingInput } from "@/types";
import { TrashIcon } from "lucide-react";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

export default function SiteInfoForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>;
  id: string;
}) {
  const { watch, control } = form;

  const siteLogo = watch("site.logo");
  return (
    <div id={id}>
    <Card>
      <CardHeader>
        <CardTitle>Site Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.name"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter site name" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="site.url"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Url</FormLabel>
                <FormControl>
                  <Input placeholder="Enter url" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="w-full text-left">
            <FormField
              control={control}
              name="site.logo"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter image url" {...field} />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />

            {siteLogo && (
              <div className="flex my-2 items-center gap-2">
                <img src={siteLogo} alt="logo" width={48} height={48} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.setValue("site.logo", "")}
                >
                  <TrashIcon className="w-4 h-4" />
                </Button>
              </div>
            )}
            {!siteLogo && (
              <UploadButton
                className="!items-start py-2"
                endpoint="logos"
                onClientUploadComplete={(res) => {
                  form.setValue("site.logo", res[0].url);
                }}
                onUploadError={(error: Error) => {
                  toast.error(`ERROR! ${error.message}`);
                }}
              />
            )}
          </div>
          <FormField
            control={control}
            name="site.description"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <AutoResizeTextarea
                    placeholder="Enter description"
                    className="h-40"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.slogan"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Slogan</FormLabel>
                <FormControl>
                  <Input placeholder="Enter slogan name" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="site.keywords"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Keywords</FormLabel>
                <FormControl>
                  <Input placeholder="Enter keywords" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.phone"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="site.email"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-5 md:flex-row">
          <FormField
            control={control}
            name="site.address"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="site.copyright"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Copyright</FormLabel>
                <FormControl>
                  <Input placeholder="Enter copyright" {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-3 rounded-lg border border-muted p-4">
          <div>
            <h3 className="text-sm font-semibold">SMS Notifications (Africa&apos;s Talking)</h3>
            <p className="text-muted-foreground text-xs">
              Configure SMS delivery for admin alerts and customer order updates.
              API keys are loaded securely from server environment variables.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormField
              control={control}
              name="notifications.sms.enabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable SMS notifications</FormLabel>
                    <p className="text-muted-foreground text-xs">Sends SMS alongside email where phone numbers are available.</p>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="notifications.sms.sandboxMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3">
                  <FormControl>
                    <Checkbox checked={!!field.value} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Sandbox mode</FormLabel>
                    <p className="text-muted-foreground text-xs">Safe testing mode — messages are logged and not delivered live.</p>
                  </div>
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col gap-5 md:flex-row">
            <FormField
              control={control}
              name="notifications.sms.username"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Africa&apos;s Talking Username</FormLabel>
                  <FormControl>
                    <Input placeholder="sandbox" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="notifications.sms.senderId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Sender ID (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ShoePedi" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={control}
            name="notifications.sms.adminRecipients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Admin SMS Recipients</FormLabel>
                <FormControl>
                  <AutoResizeTextarea
                    placeholder="+254700000000, +254711111111"
                    className="min-h-20"
                    {...field}
                  />
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  Comma or semicolon-separated E.164 phone numbers for admin alert SMS.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
