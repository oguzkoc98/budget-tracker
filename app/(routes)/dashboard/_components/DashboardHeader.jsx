import { UserButton } from "@clerk/nextjs";

function DashboardHeader() {
  return (
    <div className="p-5 flex justify-between">
      <div></div>
      <div>
        <UserButton />
      </div>
    </div>
  );
}

export default DashboardHeader;
