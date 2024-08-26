import {
  Calendar,
  CellSignalFull,
  ChatCircleDots,
  Gauge,
  MagnifyingGlass,
  // PaperPlaneTilt,
  Users,
} from "@phosphor-icons/react";

const Nav_Buttons = [
  {
    index: 0,
    icon: <Gauge size={28} />,
    link: "/",
  },
/*   {
    index: 1,
    icon: <Calendar size={28} />,
    link: "/Scheduled",
  }, */
  {
    index: 2,
    icon: <CellSignalFull size={28} />,
    link: "/connections",
  },
  {
    index: 3,
    icon: <ChatCircleDots size={28} />,
    link: "/tickets",
  },
  {
    index: 4,
    icon: <Users size={28} />,
    link: "/contacts",
  },
  {
    index: 4,
    icon: <MagnifyingGlass size={28} />,
    link: "/search",
  },
  // {
  //   index: 5,
  //   icon: <PaperPlaneTilt size={28} />,
  //   link: "/transmission",
  // },
];
export { Nav_Buttons };
