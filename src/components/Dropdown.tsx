import React from "react";

interface DropdownProps {
  list: MediaDeviceInfo[]; //add list types if required maybe an optional mediaDeviceInfo like a options prop
  handler: (...args: any[]) => any;
}
const Dropdown = (props: DropdownProps) => {
  const listItems = props.list.map((item, index) => (
    <option key={item.label} value={item.label}>
      {item.label}
    </option>
  ));

  return (
    <>
      <label className="mb-1 block">Select Webcam</label>
      <select
        onChange={(choice) => props.handler(choice.target.selectedIndex)}
        className={`rounded-xl border-2 border-black p-3 focus:outline-none`}
      >
        {listItems}
      </select>
    </>
  );
};

Dropdown.defaultProps = {
  list: [],
};

export default Dropdown;
