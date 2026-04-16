import Link from "next/link";
import { CheckCircle2, Lock, MapPin, User } from "lucide-react";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ProductPrice from "@/components/shared/product/product-price";
import { AddressBookEntry, ShippingAddress } from "@/types";
import { toSignInPath } from "@/lib/redirects";
import { shippingAddressDefaultValues } from "@/features/checkout/utils";

type Props = {
  session: unknown;
  isAddressSelected: boolean;
  shippingAddress?: ShippingAddress;
  setIsAddressSelected: (value: boolean) => void;
  setIsPaymentMethodSelected: (value: boolean) => void;
  setIsDeliveryDateSelected: (value: boolean) => void;
  addressBook: AddressBookEntry[];
  selectedSavedAddressId: string;
  setSelectedSavedAddressId: (id: string) => void;
  selectedSavedAddress?: AddressBookEntry;
  shippingAddressForm: UseFormReturn<ShippingAddress>;
  onSubmitShippingAddress: SubmitHandler<ShippingAddress>;
  saveAddressToAccount: boolean;
  setSaveAddressToAccount: (value: boolean) => void;
  isSubmittingAddress: boolean;
  counties: string[];
  places: { city: string; rate: number }[];
  selectedCounty?: string;
  isCountiesLoading: boolean;
  isPlacesLoading: boolean;
  countiesError: string | null;
  placesError: string | null;
};

function GuestSignInNotice() {
  return (
    <Card className="md:ml-8 my-4 bg-primary/5 border-primary/20">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-sm">Returning customer?</p>
              <p className="text-xs text-muted-foreground">Sign in to use your saved addresses and earn rewards.</p>
            </div>
          </div>
          <Link href={toSignInPath("/checkout")}>
            <Button variant="outline" size="sm" className="gap-2">
              <Lock className="h-3.5 w-3.5" />
              Sign In
            </Button>
          </Link>
        </div>
        <div className="rounded-lg border border-primary/20 bg-white/70 p-3 text-xs text-muted-foreground">
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />Secure payment processing</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />Real-time order updates by email</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-primary" />Checkout without creating an account</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

function SavedAddressSelector({
  addressBook,
  selectedSavedAddressId,
  setSelectedSavedAddressId,
  selectedSavedAddress,
  shippingAddressForm,
  setIsAddressSelected,
}: {
  addressBook: AddressBookEntry[];
  selectedSavedAddressId: string;
  setSelectedSavedAddressId: (id: string) => void;
  selectedSavedAddress?: AddressBookEntry;
  shippingAddressForm: UseFormReturn<ShippingAddress>;
  setIsAddressSelected: (value: boolean) => void;
}) {
  return (
    <Card className="md:ml-8 my-4 overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Select a saved address</div>
        <RadioGroup value={selectedSavedAddressId} onValueChange={setSelectedSavedAddressId} className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {addressBook.map((address) => (
            <div
              key={address.id}
              onClick={() => setSelectedSavedAddressId(address.id)}
              className={`flex h-full w-full min-w-0 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${selectedSavedAddressId === address.id ? "border-2 border-primary bg-primary/5 shadow-md" : "hover:border-primary/40"}`}
            >
              <RadioGroupItem value={address.id} id={`saved-address-${address.id}`} className="mt-1" />
              <Label htmlFor={`saved-address-${address.id}`} className="w-full min-w-0 cursor-pointer text-sm leading-relaxed">
                <span className="font-medium inline-flex w-full min-w-0 items-center gap-2">
                  {address.label}
                  {address.isDefault && <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">Default</span>}
                </span>
                <p className="break-words text-xs sm:text-sm">{address.fullName}</p>
                <p className="break-words text-xs sm:text-sm">{address.street}, {address.city}, {address.province}, {address.postalCode}, {address.country}</p>
                <p className="break-words text-xs text-muted-foreground">{address.phone}</p>
              </Label>
            </div>
          ))}
        </RadioGroup>
        {selectedSavedAddress && <p className="rounded-md border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-700"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />{selectedSavedAddress.label} is selected and will be used for delivery.</p>}
        <div className="flex flex-wrap gap-2">
          <Link href="/account/addresses?returnTo=/checkout"><Button type="button" variant="outline" size="sm">Manage/Add addresses</Button></Link>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setSelectedSavedAddressId("");
              setIsAddressSelected(false);
              shippingAddressForm.reset(shippingAddressDefaultValues);
            }}
          >
            Enter a new address
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function CheckoutShippingSection(props: Props) {
  const {
    session,
    isAddressSelected,
    shippingAddress,
    setIsAddressSelected,
    setIsPaymentMethodSelected,
    setIsDeliveryDateSelected,
    addressBook,
    selectedSavedAddressId,
    setSelectedSavedAddressId,
    selectedSavedAddress,
    shippingAddressForm,
    onSubmitShippingAddress,
    saveAddressToAccount,
    setSaveAddressToAccount,
    isSubmittingAddress,
    counties,
    places,
    selectedCounty,
    isCountiesLoading,
    isPlacesLoading,
    countiesError,
    placesError,
  } = props;

  if (isAddressSelected && shippingAddress) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-12 my-3 pb-3">
        <div className="col-span-5 flex text-lg font-bold"><span className="w-8">1 </span><span>Shipping address</span></div>
        <div className="col-span-5">
          <p>{shippingAddress.fullName} {shippingAddress.email ? `(${shippingAddress.email})` : ""}<br />{shippingAddress.street}<br />{`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}</p>
        </div>
        <div className="col-span-2"><Button variant="outline" onClick={() => { setIsAddressSelected(false); setIsPaymentMethodSelected(true); setIsDeliveryDateSelected(true); }}>Change</Button></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex text-primary text-lg font-bold my-2"><span className="w-8">1 </span><span>Enter shipping address</span></div>
      {!session && <GuestSignInNotice />}
      {!!session && addressBook.length > 0 && (
        <SavedAddressSelector
          addressBook={addressBook}
          selectedSavedAddressId={selectedSavedAddressId}
          setSelectedSavedAddressId={setSelectedSavedAddressId}
          selectedSavedAddress={selectedSavedAddress}
          shippingAddressForm={shippingAddressForm}
          setIsAddressSelected={setIsAddressSelected}
        />
      )}
      <Form {...shippingAddressForm}>
        <form method="post" onSubmit={shippingAddressForm.handleSubmit(onSubmitShippingAddress)} className="space-y-4">
          <Card className="md:ml-8 my-4">
            <CardContent className="p-4 space-y-2">
              <div className="text-lg font-bold mb-2">Your address</div>
              {!!session && <div className="flex items-center gap-2 mb-4"><Checkbox id="saveAddressToAccount" checked={saveAddressToAccount} onCheckedChange={(value) => setSaveAddressToAccount(Boolean(value))} /><Label htmlFor="saveAddressToAccount">Save this address to my account</Label></div>}
              {!session && <div className="mb-4"><FormField control={shippingAddressForm.control} name="email" render={({ field }) => (<FormItem className="w-full"><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="Enter your email" type="email" {...field} /></FormControl><FormMessage /></FormItem>)} /></div>}
              <FormField control={shippingAddressForm.control} name="fullName" render={({ field }) => (<FormItem className="w-full"><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Enter full name" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={shippingAddressForm.control} name="street" render={({ field }) => (<FormItem className="w-full"><FormLabel>Address</FormLabel><FormControl><Input placeholder="Enter address" {...field} /></FormControl><FormMessage /></FormItem>)} />
              <div className="flex flex-col gap-5 md:flex-row">
                <FormField control={shippingAddressForm.control} name="province" render={({ field }) => (<FormItem className="w-full"><FormLabel>County</FormLabel><FormControl><Select value={field.value} onValueChange={(val) => { field.onChange(val); shippingAddressForm.setValue("city", ""); }}><SelectTrigger><SelectValue placeholder={isCountiesLoading ? "Loading counties..." : "Select county"} /></SelectTrigger><SelectContent>{counties.map((c) => (<SelectItem key={c} value={c}>{c}</SelectItem>))}</SelectContent></Select></FormControl>{countiesError && <p className="text-xs text-destructive mt-1">{countiesError}</p>}<FormMessage /></FormItem>)} />
                <FormField control={shippingAddressForm.control} name="city" render={({ field }) => (<FormItem className="w-full"><FormLabel>Delivery place</FormLabel><FormControl><Select value={field.value} onValueChange={field.onChange} disabled={!selectedCounty || places.length === 0 || isPlacesLoading}><SelectTrigger><SelectValue placeholder={isPlacesLoading ? "Loading places..." : "Select delivery place"} /></SelectTrigger><SelectContent>{places.map((p) => (<SelectItem key={p.city} value={p.city}>{p.city} (<ProductPrice price={p.rate} plain />)</SelectItem>))}</SelectContent></Select></FormControl>{!selectedCounty && <p className="text-xs text-muted-foreground">Select a county first to load delivery places.</p>}{selectedCounty && isPlacesLoading && <p className="text-xs text-muted-foreground">Loading delivery places...</p>}{placesError && <p className="text-xs text-destructive mt-1">{placesError}</p>}<FormMessage /></FormItem>)} />
                <FormField control={shippingAddressForm.control} name="country" render={({ field }) => (<FormItem className="w-full"><FormLabel>Country</FormLabel><FormControl><Input placeholder="Enter country" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
              <div className="flex flex-col gap-5 md:flex-row">
                <FormField control={shippingAddressForm.control} name="postalCode" render={({ field }) => (<FormItem className="w-full"><FormLabel>Postal Code</FormLabel><FormControl><Input placeholder="Enter postal code" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={shippingAddressForm.control} name="phone" render={({ field }) => (<FormItem className="w-full"><FormLabel>Phone number</FormLabel><FormControl><Input placeholder="Enter phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            </CardContent>
            <CardFooter className="p-4"><Button type="submit" className="rounded-full font-bold cursor-pointer" disabled={isSubmittingAddress}>{isSubmittingAddress ? "Saving address..." : "Ship to this address"}</Button></CardFooter>
          </Card>
        </form>
      </Form>
    </>
  );
}
