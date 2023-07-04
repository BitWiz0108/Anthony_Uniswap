const Button = ({ label, onClick}) => {
  return (
    <button
      className={
        "inline-flex justify-center items-center w-[170px] min-w-[170px] h-[50px] min-h-[50px] py-2 text-white font-bold text-sm border-2 border-primary hover:bg-blueSecondary hover:border-blueSecondary rounded-lg outline-none focus:outline-none transition-all duration-300 cursor-pointer"}
      onClick={() => onClick()}
    >
    </button>
  );
};

export default Button;
