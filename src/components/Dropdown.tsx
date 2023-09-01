import React from 'react';

interface DropdownProps {
    list: MediaDeviceInfo[] | []; //add list types if required maybe an optional mediaDeviceInfo like a options prop
    handler: Function;
}
const Dropdown = (props: DropdownProps) => {
    
    const listItems = props.list.map(item =>
        <option value = {item.label}>{item.label}</option>// only specifc to MediadeviceInfo
        ); 
    
    return (
    <div>
        <label>
            <select onChange = {(choice) => props.handler(choice.target.selectedIndex)}>{listItems}</select> 
        </label>
    </div>
    );
}
export default Dropdown;