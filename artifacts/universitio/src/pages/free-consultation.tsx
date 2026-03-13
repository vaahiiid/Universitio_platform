import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { consultationSchema } from "@/hooks/use-form-mutations";
import { useSubmitConsultation } from "@/hooks/use-form-mutations";
import { z } from "zod";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CheckCircle } from "lucide-react";

export default function FreeConsultation() {
  const mutation = useSubmitConsultation();
  
  const form = useForm<z.infer<typeof consultationSchema>>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      name: "", email: "", phone: "", country: "", 
      destination: "", studyInterest: "", startDate: "", message: ""
    }
  });

  function onSubmit(values: z.infer<typeof consultationSchema>) {
    mutation.mutate(values);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4">Book Your Free Consultation</h1>
            <p className="text-lg text-muted-foreground">Take the first step towards your international education journey. Fill out the form below and one of our experts will be in touch.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-border p-6 md:p-10">
            {mutation.isSuccess ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Request Received!</h2>
                <p className="text-lg text-muted-foreground mb-8">Thank you for reaching out. A Universitio education consultant will contact you within 24 hours.</p>
                <Button onClick={() => form.reset()} variant="outline">Submit Another Request</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number (with Country Code)</FormLabel><FormControl><Input placeholder="+44 7XXX XXXXXX" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="country" render={({ field }) => (
                      <FormItem><FormLabel>Country of Origin</FormLabel><FormControl><Input placeholder="e.g. India, Nigeria" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    
                    <FormField control={form.control} name="destination" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Intended Study Destination</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="uk">United Kingdom</SelectItem>
                            <SelectItem value="usa">United States</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                            <SelectItem value="europe">Europe</SelectItem>
                            <SelectItem value="undecided">Not Sure Yet</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={form.control} name="studyInterest" render={({ field }) => (
                      <FormItem>
                        <FormLabel>What are you looking to study?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="bachelors">Undergraduate (Bachelor's)</SelectItem>
                            <SelectItem value="masters">Postgraduate (Master's)</SelectItem>
                            <SelectItem value="phd">PhD / Research</SelectItem>
                            <SelectItem value="school">School / College</SelectItem>
                            <SelectItem value="english">English Language Course</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="startDate" render={({ field }) => (
                    <FormItem>
                      <FormLabel>When are you planning to start?</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select timeline" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="immediate">As soon as possible</SelectItem>
                          <SelectItem value="6months">Within 6 months</SelectItem>
                          <SelectItem value="1year">Within 1 year</SelectItem>
                          <SelectItem value="more1year">More than 1 year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Information (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Tell us more about your background, goals, or any specific questions..." className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="pt-4 flex flex-col items-center">
                    <Button type="submit" size="lg" className="w-full md:w-auto px-12 h-14 rounded-full text-lg" disabled={mutation.isPending}>
                      {mutation.isPending ? "Submitting..." : "Submit Request"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-4 text-center max-w-md">
                      By submitting this form, you agree to our Privacy Policy. Universitio will safely store your data in accordance with ICO regulations.
                    </p>
                  </div>
                </form>
              </Form>
            )}
          </div>
          
        </div>
      </main>

      <Footer />
    </div>
  );
}
