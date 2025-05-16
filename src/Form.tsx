import { useAccount } from "jazz-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "./components/ui/card";
import { Label } from "./components/ui/label";
import { Input } from "./components/ui/input";

export function Form() {
  const { me } = useAccount({ resolve: { profile: true, root: true } });

  if (!me) return null;

  return (
    <Card className="max-w-md w-full mx-auto">
      <CardHeader>
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            type="text"
            id="firstName"
            placeholder="Enter your first name here..."
            value={me.profile.firstName || ""}
            onChange={(e) => (me.profile.firstName = e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            placeholder="Enter your name here..."
            value={me.profile.name || ""}
            onChange={(e) => (me.profile.name = e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="dateOfBirth">Date of birth</Label>
          <Input
            type="date"
            id="dateOfBirth"
            value={me.root.dateOfBirth?.toISOString().split("T")[0] || ""}
            onChange={(e) => (me.root.dateOfBirth = new Date(e.target.value))}
          />
        </div>
        {/*Add more fields here*/}
      </CardContent>
      <CardFooter />
    </Card>
  );
}
