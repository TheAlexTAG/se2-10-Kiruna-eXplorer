import React, { useEffect, useState } from "react";
import { MultiValue } from "react-select";
import CreatableSelect from "react-select/creatable";

interface OptionType {
  value: string;
  label: string;
}

interface CustomSelectBoxProps {
  options: OptionType[];
  handleSelect: (
    selectedOptions: MultiValue<OptionType> | OptionType | null
  ) => void;
  isMulti: boolean;
  value?: any;
}

const CustomSelectBox = ({
  options,
  handleSelect,
  isMulti,
  value,
}: CustomSelectBoxProps) => {
  const [selectedOptions, setSelectedOptions] = useState<
    OptionType[] | OptionType | null
  >(isMulti ? [] : null);

  const handleChange = (
    newValue: readonly OptionType[] | OptionType | null
  ) => {
    if (isMulti) {
      const newOptions = newValue as OptionType[];
      setSelectedOptions(newOptions);
      handleSelect(newOptions);
    } else {
      const newOption = newValue as OptionType | null;
      setSelectedOptions(newOption);
      handleSelect(newOption);
    }
  };

  const handleCreate = (inputValue: string) => {
    const newOption: OptionType = { value: inputValue, label: inputValue };

    if (isMulti) {
      const newOptions = [...(selectedOptions as OptionType[]), newOption];
      setSelectedOptions(newOptions);
      handleSelect(newOptions);
    } else {
      setSelectedOptions(newOption);
      handleSelect(newOption);
    }
  };
  useEffect(() => {
    if (value) {
      setSelectedOptions(value);
    }
  }, []);

  return (
    <div>
      <CreatableSelect
        isMulti={isMulti}
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        onCreateOption={handleCreate}
        placeholder="Select or add custom options"
        className="custom-input"
      />
    </div>
  );
};

export default CustomSelectBox;
