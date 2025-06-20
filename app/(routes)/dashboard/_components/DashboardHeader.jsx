import CustomUserDropdown from "./CustomUserDropdown";

function DashboardHeader() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 md:px-8 relative z-30">
      <div className="flex justify-end items-center">
        <CustomUserDropdown size="default" />
      </div>
    </div>
  );
}

export default DashboardHeader;
