import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F9F8F4] py-12 px-4">
      <div className="w-full max-w-md">
        <Card className="border-t-4 border-[#D4AF37] shadow-xl">
          <CardContent className="pt-8 pb-6 px-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo.jpeg"
                alt="RealX World"
                width={100}
                height={34}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-[#0A0A0A]">{title}</h1>
              {subtitle && (
                <p className="text-gray-500 mt-1 text-sm">{subtitle}</p>
              )}
            </div>
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
