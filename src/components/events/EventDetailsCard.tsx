"use client";
import { useUser } from "@/lib/store/user";
import { checkIfRegistered } from "@/utils/functions/checkIfRegistered";
import { clickSound } from "@/utils/functions/clickSound";
import { getEventById } from "@/utils/functions/getEventById";
import { login } from "@/utils/functions/login";
import parse from "html-react-parser";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ClipLoader from "react-spinners/ClipLoader";
import EventRegForm from "./EventRegModal";
import { TiTick } from "react-icons/ti";
import RulesModal from "./RulesModal";
import { EVENT_CATEGORIES } from "@/utils/constants/event-categories";
import { supabase } from "@/lib/supabase-client";
import RegButton from "./RegButton";
import Link from "next/link";
const EventDetailsCard = ({ eventId }: { eventId: string }) => {
  const [eventDetails, setEventDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openRegister, setOpenRegister] = useState(false);
  const [openRules, setOpenRules] = useState<boolean>(false);
  const [throughPortal, setThroughPortal] = useState<boolean>(false);
  const [registeredEvent, setRegisteredEvent] = useState<boolean>(false);
  const [openResult, setOpenResult] = useState(false);
  const [isForCSE, setIsForCSE] = useState<boolean>(true);
  const user = useUser((state) => state.user);

  const eventsForCSE = [
    "efe69592-f939-4c62-bc9f-c3a8529d5d5a",
    "9cb652d2-5026-473b-b562-0bea0c036009",
    "4506ea8e-c7b5-49dd-a856-60cd96713335",
    "08242c79-6478-478a-ad9b-4ed6d089c02d",
  ];

  const formLinks = [
    {
      id: "08242c79-6478-478a-ad9b-4ed6d089c02d",
      form: "https://forms.gle/Z1HvYLmv952DLSLeA",
    },
    {
      id: "4506ea8e-c7b5-49dd-a856-60cd96713335",
      form: "https://forms.gle/xmLY8inhQ6RjY3XK8",
    },
    {
      id: "9cb652d2-5026-473b-b562-0bea0c036009",
      form: "https://forms.gle/9mmFycEw93sbQDaC8",
    },
    {
      id: "a4c6d277-d77e-45ca-9978-ed6e93337057",
      form: "https://forms.gle/dmXBKNHzWPJiRViB6",
    },
    {
      id: "efe69592-f939-4c62-bc9f-c3a8529d5d5a",
      form: "https://forms.gle/2D9Zz482kWUiVMG3A",
    },
    {
      id: "46d522e2-0135-4582-9d45-7f70c8e6fc32",
      form: "https://techtrek.devfolio.co/",
    },
  ];

  const [formLink, setFormLink] = useState<string>("");

  useEffect(() => {
    if (eventDetails && eventDetails?.register_through_portal === false) {
      setThroughPortal(false);
    } else {
      setThroughPortal(true);
    }
  }, [eventDetails]);

  useEffect(() => {
    if (user) {
      console.log(eventsForCSE.includes(eventId));
      if (user?.department === "CSE" && eventsForCSE.includes(eventId)) {
        setIsForCSE(true);
      } else if (!eventsForCSE.includes(eventId)) {
        setIsForCSE(true);
      } else {
        setIsForCSE(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchEvent = async () => {
      const registered: any = await checkIfRegistered(eventId, user!);

      setRegisteredEvent(registered);
      const event = await getEventById(eventId);
      setEventDetails(event);


      if (!throughPortal) {
        const matchedFormLink = formLinks.find((link) => link.id === eventId);
        setFormLink(matchedFormLink?.form!);
      }
      setLoading(false);
    };
    fetchEvent();
  }, [eventId, user, throughPortal]);

  useEffect(() => {
    if (openRegister && openRules && openResult) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  });
  return (
    <>
      {loading ? (
        <div className="flex flex-col w-full items-center justify-center mx-auto mt-10">
          <ClipLoader color="#B51C69" loading={loading} size={50} />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-10 mx-auto w-full">
          <h1 className="text-4xl md:text-5xl text-white text-center font-Chakra_Petch font-bold">
            EVENT :{" "}
            <span id="glow" className="tracking-wider">
              {eventDetails.event_name.toUpperCase()}
            </span>
          </h1>
          <div className="border-4 backdrop-blur hover:backdrop-blur-0 rounded-xl border-white flex w-full flex-row font-Chakra_Petch  justify-center gap-5 px-5 md:px-10 py-5 max-md:flex-wrap-reverse md:items-start lg:items-center">
            <div className="items-left text-white flex w-full flex-col justify-center gap-5 md:w-[5/6] lg:w-[70%]">
              <h1
                id="glow"
                className="text-center text-3xl font-bold tracking-widest     md:pb-6"
              >
                {eventDetails.event_name.toUpperCase()}
              </h1>
              <div className="flex flex-col-reverse justify-between gap-5 text-lg md:flex-row">
                <div className=" space-y-5">
                  <div className="items-left flex flex-col justify-center gap-5 text-white text-sm tracking-widest md:text-xs lg:text-base">
                    {parse(eventDetails.description)}
                  </div>

                  <div className="items-left flex flex-row flex-wrap  gap-5   tracking-widest">
                    <h1 id="glow" className="italic">
                      SCHEDULE
                    </h1>
                    {parse(eventDetails.schedule)}
                  </div>
                  <div className="items-left flex flex-row flex-wrap gap-5   tracking-widest">
                    <h1 id="glow" className="italic ">
                      TEAM SIZE :{" "}
                    </h1>
                    {eventDetails?.max_team_size > 1
                      ? eventDetails?.min_team_size +
                        " - " +
                        eventDetails?.max_team_size
                      : 1 + " (Solo)"}
                  </div>
                  {/* <div className="items-left flex flex-row flex-wrap  gap-5   tracking-widest">
                    <h1 id="glow" className="italic">
                      VENUE
                    </h1>
                    {parse(eventDetails.schedule)}
                  </div> */}
                  <div className="items-left flex flex-row flex-wrap  gap-5   tracking-widest">
                    <h1 id="glow" className="italic">
                      EVENT MODE
                    </h1>
                    {parse(eventDetails.event_mode)}
                  </div>
                  <h1 className="text-xl font-Chakra_Petch italic" id="glow">
                    COORDINATORS :
                  </h1>
                  {!loading && eventDetails?.roles.length > 0 ? (
                    eventDetails?.roles
                      .filter((role: any) => role.role !== "VOLUNTEER")
                      ?.map((coordinator: any, index: number) => {
                        return (
                          <div
                            key={index}
                            className="flex flex-col items-start gap-2   text-white"
                          >
                            <span className="flex flex-row items-center gap-4 text-base font-semibold tracking-widest ">
                              {coordinator?.users?.name.toUpperCase()}
                              <a
                                href={`tel:${coordinator?.users?.phone}`}
                                className="text-lg font-semibold tracking-widest text-white hover:text-green-500 lg:text-base"
                              >
                                {coordinator?.users?.phone}
                              </a>
                            </span>
                          </div>
                        );
                      })
                  ) : (
                    <h1 className="text-center   text-sm font-semibold text-red-600">
                      No Coordinators added yet !
                    </h1>
                  )}
                </div>
              </div>
              <div className=" flex flex-row space-x-5">
                <button
                  onClick={() => setOpenRules(true)}
                  className="text-white px-2 py-2 w-40 md:w-48 lg:w-64 rounded-lg text-xs lg:text-md font-Chakra_Petch italic bg-[#B51C69] shadow-[4.0px_8.0px_8.0px_gray]"
                >
                  View Rules and Regulations
                </button>
              </div>
            </div>
            <div className="mx-auto flex h-full w-full flex-col max-lg:mt-10 max-md:mt-0 md:w-[1/6] lg:w-auto gap-5">
              <Image
                src={eventDetails?.banner_url || "/events/Background-img.png"}
                alt="hero"
                height={600}
                width={350}
                className=" mx-auto rounded-2xl object-cover object-left-top"
              />
              {
  eventDetails?.result_out ? (
    <button
      onClick={() => setOpenResult(true)}
      className="relative mx-auto my-2 inline-flex h-12 w-auto overflow-hidden rounded-full p-1 font-retrolight focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 md:my-3"
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FEC923_0%,#0917F5_50%,#FEC923_100%)]" />
      <span className="text-md inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-12 py-5 font-medium tracking-wider text-white backdrop-blur-3xl md:text-sm lg:px-5 lg:py-3 lg:text-sm">
        Result
      </span>
    </button>
  ) : eventDetails?.is_open ? (
    isForCSE ? (
      !registeredEvent && !throughPortal ? (
        <Link href={formLink!} target="_blank">
          <RegButton eventDetails={eventDetails} onClick={() => {}} />
        </Link>
      ) : ( !registeredEvent &&
        <RegButton
          eventDetails={eventDetails}
          onClick={async () => {
            if (!user) login();
            clickSound();
            setOpenRegister(true);
          }}
        />
      )
    ) : (
      <button
        onClick={() => toast.success("Only CSE Departments can register for this event!")}
        className="relative flex flex-row mx-auto items-center"
      >
        <Image
          width={100}
          height={40}
          src="https://i.postimg.cc/kXR0L9dy/Button.png"
          className="h-10 w-28 lg:h-14 lg:w-36 lg:text-sm"
          alt="Events for CSE Only"
        />
        <h1 className="absolute mx-3 lg:mx-5 font-Chakra_Petch text-[#B61B69] text-xs lg:text-sm font-bold">
          Events for CSE Only
        </h1>
      </button>
    )
  ) : (
    <button
      onClick={() => toast("Registration Closed !", { icon: "🚫" })}
      className="relative mx-auto my-2 inline-flex h-12 w-auto overflow-hidden rounded-full p-1 font-retrolight focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 md:my-3"
      disabled
    >
      <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FEC923_0%,#0917F5_50%,#FEC923_100%)]" />
      <span className="text-md inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-12 py-5 font-medium tracking-wider text-white backdrop-blur-3xl md:text-sm lg:px-5 lg:py-3 lg:text-sm">
        Registration Closed
      </span>
    </button>
  )
}

{registeredEvent && (
  <button
    className="relative mx-auto my-2 inline-flex h-12 w-auto overflow-hidden rounded-full p-1 font-retrolight focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 md:my-3"
    onClick={() => {}}
  >
    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FEC923_0%,#0917F5_50%,#FEC923_100%)]" />
    <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white backdrop-blur-3xl md:text-sm lg:text-sm">
      Already Registered
      <TiTick size={24} />
    </span>
  </button>
)}

            </div>
          </div>
          <EventRegForm
            isOpen={openRegister}
            onClose={() => setOpenRegister(false)}
            eventDetails={eventDetails}
            throughPortal={throughPortal}
          />
          <RulesModal
            isOpen={openRules}
            onClose={() => setOpenRules(false)}
            rules={eventDetails?.rules}
          />
        </div>
      )}
    </>
  );
};

export default EventDetailsCard;
