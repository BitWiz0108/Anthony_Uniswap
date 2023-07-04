const Button = ({ label, onClick }) => {
  return (
    <button
      className={
        `inline-flex justify-center items-center w-[170px] min-w-[170px] h-[50px] min-h-[50px] py-2 text-white font-bold  hover:text-yellow-500
        text-sm border-2 border-primary rounded-lg outline-none focus:outline-none hover:bg-blue-700 hover:border-blue-300 hover:scale-110
        transition-all duration-300 cursor-pointer`
      }
      onClick={() => onClick()}
    >
      <span>{label}</span>
    </button>
  );
};

export default Button;
