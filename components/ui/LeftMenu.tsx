interface MenuButton {
  name: string;
  icon: string;
  action: () => void;
}

interface MenuButtonProps {
  button: MenuButton;
}

function MenuButtonItem({ button }: MenuButtonProps) {
  return (
    <button
      type="button"
      onClick={button.action}
      className="w-full h-16 p-2 flex items-center bg-transparent hover:bg-gray-100 hover:cursor-pointer rounded-lg transition-colors overflow-hidden group "
    >
      <div className="w-[25%] flex items-center justify-center p-3 bg-white group-hover:bg-emerald-600 rounded transition-colors">
        <img src={button.icon} alt={button.name} className="w-full" />
      </div>
      <div className="w-[75%] text-left font-bold text-gray-500 p-3">
        <span>{button.name}</span>
      </div>
    </button>
  );
}

interface LeftMenuProps {
  buttons?: MenuButton[];
}

function LeftMenu({ buttons = [] }: LeftMenuProps) {
  return (
    <>
      <div className="w-[25%] h-full p-4">
        <div className="bg-white rounded-2xl shadow-2xl h-full flex flex-col">
          <div className="w-[90%] p-4">
            <img src="/nisit-deeden.svg" alt="Logo" className="w-full" />
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {buttons.map((button, index) => (
              <MenuButtonItem key={index} button={button} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default LeftMenu;
