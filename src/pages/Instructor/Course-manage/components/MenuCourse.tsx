import { Tabs } from "antd";
import type { TabsProps } from "antd";
import DetailCoures from "./DetailCoures";
import ClassManagement from "../../Class-manage/Class-manage";

const MenuCourse = () => {
  const onChange = (key: string) => {
    console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Detail Course",
      children: <DetailCoures />,
    },
    {
      key: "2",
      label: "Class",
      children: <ClassManagement />,
    },
  ];
  return <Tabs defaultActiveKey="1" items={items} onChange={onChange} />;
};

export default MenuCourse;
