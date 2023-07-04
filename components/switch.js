import { twMerge } from "tailwind-merge";

const Switch = ({ label, checked, setChecked, labelPos }) => {
  return (
    <div
      className={twMerge(
        "flex justify-start items-center",
        labelPos == "top" || labelPos == "bottom"
          ? "flex-col space-y-2"
          : "flex-row space-x-2"
      )}
    >
      {(labelPos == "top" || labelPos == "left") && (
        <label
          htmlFor="checkbox"
          className="text-lg text-center text-white"
        >
          {label}
        </label>
      )}

      <input
        id="checkbox"
        type="checkbox"
        className="absolute left-0 top-0 w-full h-full opacity-0 cursor-pointer"
        checked={checked}
        onChange={(e) => setChecked(e.target.checked)}
      />
      <div
        className={twMerge(
          "w-14 h-7 rounded-full overflow-hidden p-0.5 transition-all duration-300",
          checked ? "bg-blue-900" : "bg-gray-700"
        )}
      >
        <div
          className={twMerge(
            "w-6 h-6 rounded-full bg-white overflow-hidden transition-all duration-300",
            checked ? "ml-[52%] mr-0.5" : "mr-[52%] ml-0.5"
          )}
        ></div>
      </div>

      {(labelPos == "bottom" || labelPos == "right") && (
        <label
          htmlFor="checkbox"
          className="text-lg text-white text-center"
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Switch;
