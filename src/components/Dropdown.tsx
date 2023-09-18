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
    <div>
      <label>
        <select
          onChange={(choice) => props.handler(choice.target.selectedIndex)}
        >
          {listItems}
        </select>
      </label>
    </div>
  );
};

Dropdown.defaultProps = {
  list: [],
};

export default Dropdown;
