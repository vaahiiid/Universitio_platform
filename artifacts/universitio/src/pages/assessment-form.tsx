import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { assessmentSchema, useSubmitAssessment } from "@/hooks/use-form-mutations";
import { z } from "zod";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClipboardList, CheckCircle } from "lucide-react";

export default function AssessmentForm() {
  const mutation = useSubmitAssessment();
  const form = useForm<z.infer<typeof assessmentSchema>>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: { fullName: "", email: "", educationLevel: "", budget: "", timeline: "" }
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center mb-10">
            <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ClipboardList className="w-8 h-8" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Student Assessment Profile</h1>
            <p className="text-lg text-muted-foreground">Complete this quick profile to help us match you with the best universities and pathways for your unique background.</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-border p-6 md:p-10">
            <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <p className="text-sm text-blue-800 text-center font-medium">Full comprehensive assessment module coming soon. Fill out the preliminary details below.</p>
            </div>

            {mutation.isSuccess ? (
              <div className="text-center py-12">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Profile Created</h3>
                <p className="text-muted-foreground mb-6">Our team is reviewing your assessment and will contact you.</p>
                <Button onClick={() => form.reset()} variant="outline">Reset Form</Button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
                  
                  <FormField control={form.control} name="fullName" render={({ field }) => (
                    <FormItem><FormLabel>Full Legal Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="jane@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  
                  <FormField control={form.control} name="educationLevel" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Highest Current Education Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select level" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="highschool">High School / Secondary</SelectItem>
                          <SelectItem value="diploma">Diploma / Associate Degree</SelectItem>
                          <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                          <SelectItem value="masters">Master's Degree</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="budget" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estimated Annual Budget (Tuition + Living)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select budget range" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="under15k">Under £15,000</SelectItem>
                          <SelectItem value="15kto25k">£15,000 - £25,000</SelectItem>
                          <SelectItem value="25kto40k">£25,000 - £40,000</SelectItem>
                          <SelectItem value="over40k">Over £40,000</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="timeline" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intended Intake</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select intake" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="sep2025">September 2025</SelectItem>
                          <SelectItem value="jan2026">January 2026</SelectItem>
                          <SelectItem value="sep2026">September 2026</SelectItem>
                          <SelectItem value="later">Later</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <Button type="submit" className="w-full h-12 text-md rounded-xl" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving Profile..." : "Submit Preliminary Assessment"}
                  </Button>
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
