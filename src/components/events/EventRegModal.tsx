import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BeatLoader, ClipLoader, PuffLoader } from "react-spinners";
import FormElement from "./FormElement";
import { clickSound } from "@/utils/functions/clickSound";
import { useUser } from "@/lib/store/user";
import { validateReg } from "@/utils/functions/validateReg";
import { eventReg } from "@/utils/functions/eventReg";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

const EventRegForm = ({
  isOpen,
  onClose,
  eventDetails,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: any;
}) => {
  console.log(eventDetails);
  const router = useRouter();
  const eventId = eventDetails?.id;
  const [disabled, setDisabled] = useState<boolean>(false);
  const [requirement, setRequirement] = useState<any>([]);
  const [inputs, setInputs] = useState<any>({
    teamName: "",
    teamLeadPhone: "",
    teamLeadEmail: "",
    teamLeadName: "",
    teamLeadRoll: "",
    regMode: "",
  });

  const user = useUser((state) => state.user);
  const minTeamMember = eventDetails?.min_team_size;
  const maxTeamMember = eventDetails?.max_team_size;
  useEffect(() => {
    if (user) {
      setInputs((prevInputs: any) => ({
        ...prevInputs,
        teamLeadPhone: user.phone,
        teamLeadEmail: user.email,
        teamName: maxTeamMember > 1 ? "" : user.name, 
        teamLeadName: user.name,
      }));
    }
  }, [user, maxTeamMember]);

  const [participants, setParticipants] = useState<any>([]);
  useEffect(() => {
    if (minTeamMember !== undefined && minTeamMember !== null) {
      const blankParticipants = [];

      for (let i = 0; i < minTeamMember; i++) {
        blankParticipants.push({ phone: "", email: "", name: "" });
      }
      setParticipants(blankParticipants);
    }
  }, [minTeamMember]);
  
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>
  ) => {
    const { name, value } = e.target;
    setInputs((prevInputs: any) => ({
      ...prevInputs,
      [name]: value,
    }));
    if (maxTeamMember == 1) {
      setInputs((prevInputs: any) => ({
        ...prevInputs,
        teamLeadName: prevInputs.teamName,
      }));
    }
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].email = value;
    if (index == 0) {
      updatedParticipants[0].email = inputs.teamLeadEmail;
    }
    setParticipants(updatedParticipants);
  };
  const handleNameChange = (index: number, value: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].name = value;
    if (index == 0) {
      updatedParticipants[0].name = inputs.teamLeadName;
    }
    setParticipants(updatedParticipants);
  };

  const handlePhoneChange = (index: number, value: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].phone = value;
    setParticipants(updatedParticipants);
  };

  const addParticipant = () => {
    const newParticipant:any = {
      phone: "",
      name: "",
      email: ""
    };
    requirement.forEach((req: any) => {
      const fieldKey = req.toLowerCase().replace(/ /g, "_");
      newParticipant[fieldKey] = "";
    });
    setParticipants((prevParticipants:any) => [...prevParticipants, newParticipant]);
  };

  const removeParticipant = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
  };

  const [generalErrors, setGeneralErrors] = useState<any>({});
  const [teamErrors, setTeamErrors] = useState<any>({});
  let teamMemberCountError = "";
  const handleSubmit = async () => {
    clickSound();
    try {
      const res = validateReg(inputs, participants, maxTeamMember);

      const allFieldsEmpty =
        Object.values(res.errors).every((value) => value === "") &&
        res.teamErrors.every(
          (participant: any) =>
            participant.name === "" && participant.phone === ""
        );

      if (allFieldsEmpty) {
        setDisabled(true); // Disable the submit button
        await eventReg(inputs, participants, eventId);
        toast.success("Registration Successful");
        onClose();
        router.push("/dashboard");
      } else {
        // If there are errors, enable the submit button
        setDisabled(false);
        if (res.errors || res.teamErrors) {
          setGeneralErrors(res.errors);
          setTeamErrors(res.teamErrors);
          // toast.error("Fill all the fields accurately !");
          return;
        }
      }
    } catch (err) {
      setDisabled(false);
      console.log(err);
      toast.error("Registration Failed !");
    }
  };

  useEffect(() => {
    setRequirement(eventDetails?.requirements);
  
    setParticipants((prevParticipants: any) => {
      const updatedParticipants = prevParticipants.map((participant: any) => {
        const updatedParticipant = { ...participant };
        eventDetails?.requirements?.length > 0 &&  eventDetails?.requirements.forEach((req: any) => {
          const fieldKey = req.toLowerCase().replace(/ /g, "_");
          console.log(fieldKey)
            updatedParticipant[fieldKey] = "";
          
        });
  
        return updatedParticipant;
      });
      console.log(updatedParticipants);
      return updatedParticipants;
    });
  }, [eventDetails]);
  

  console.log(inputs);
  console.log(participants);
  return (
    <>
      {isOpen && (
        <div className="fixed  inset-0 z-[50] flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`rounded-lg border-y-2 border-[#B51C69] bg-body p-4 ${
              maxTeamMember > 1 ? "h-[80vh] md:h-[70vh]" : ""
            }   flex w-[95%] flex-col items-start lg:w-[40%] lg:px-32 lg:py-8`}
            style={{ background: 'url("/events/Background-img.png")' }}
          >
            <div className="mb-2 flex w-full flex-row items-center justify-between">
              <h2 className="text-md font-Chakra_Petch  text-[#B51C69]  font-semibold tracking-widest lg:text-lg">
                {"Registration of Event".toUpperCase()}
              </h2>
              <h2
                onClick={onClose}
                className="-mr-3 cursor-pointer rounded-full border-2 border-[#B51C69] bg-[#B51C69] px-2 py-1 text-sm font-semibold text-black hover:border-[#B51C69]   hover:bg-black hover:text-[#B51C69] md:px-3 md:py-2"
              >
                X
              </h2>
            </div>

            <div className="flex w-full flex-col items-start gap-4  overflow-x-hidden overflow-y-scroll pt-2 text-sm lg:text-lg">
              <FormElement
                type="text"
                disabled={maxTeamMember > 1 ? false : true}
                name={maxTeamMember > 1 ? "Team Name" : "Name"}
                value={inputs.teamName}
                id="teamName"
                onChange={handleInputChange}
                width="100%"
              />
              <h1 className="text-xs font-semibold text-red-600">
                {generalErrors.teamName}
              </h1>
              <FormElement
                type="number"
                disabled={maxTeamMember > 1 ? true : true}
                name={maxTeamMember > 1 ? "Team Lead Phone" : "Phone"}
                value={inputs.teamLeadPhone}
                id="teamLeadPhone"
                onChange={handleInputChange}
                width="100%"
              />
              <h1 className="text-xs font-semibold text-red-600">
                {generalErrors.teamLeadPhone}
              </h1>

              {maxTeamMember > 1 && (
                <FormElement
                  type="text"
                  disabled={maxTeamMember > 1 ? true : true}
                  name={maxTeamMember > 1 ? "Team Lead Name" : "Name"}
                  value={inputs.teamLeadName}
                  id="teamLeadName"
                  onChange={handleInputChange}
                  width="100%"
                />
              )}
              <h1 className="text-xs font-semibold text-red-600">
                {generalErrors.teamLeadName}
              </h1>
              <FormElement
                type="email"
                disabled={maxTeamMember > 1 ? true : true}
                name={maxTeamMember > 1 ? "Team Lead Email" : "Email"}
                value={inputs.teamLeadEmail}
                id="teamLeadEmail"
                onChange={handleInputChange}
                width="100%"
              />
              <h1 className="text-xs font-semibold text-red-600">
                {generalErrors.teamLeadEmail}
              </h1>

              <FormElement
                type="text"
                disabled={maxTeamMember > 1 ? true : true}
                name={maxTeamMember > 1 ? "Team Lead Roll" : "College Roll"}
                value={inputs.teamLeadRoll}
                id="teamLeadRoll"
                onChange={handleInputChange}
                width="100%"
              />
              <h1 className="text-xs font-semibold text-red-600">
                {generalErrors.teamLeadRoll}
              </h1>

              {maxTeamMember > 1 && (
                <div className="flex flex-col items-center gap-5">
                  <h1 className="font-semibold text-[#B51C69]">
                   {"Add Team Participants".toUpperCase()}
                  </h1>
                  {teamMemberCountError !== "" && (
                    <h1 className="text-xs font-semibold text-red-600">
                      {teamMemberCountError}
                    </h1>
                  )}
                  {participants.map((participant: any, index: number) => (
                    <div
                      key={index}
                      className="flex flex-row   flex-wrap items-center gap-10 rounded-lg border-2  border-regalia px-10 py-2 pb-5 text-sm"
                    >
                      <div className="flex flex-col  items-start gap-2">
                        <label
                          htmlFor=""
                          className=" text-[#B51C69]  font-semibold tracking-widest"
                        >
                          {(index == 0 ? "Team Lead" : `Person ${index + 1}`).toUpperCase()}
                        </label>

                        <div className="flex flex-col items-start gap-3">
                          <div className="flex flex-row flex-wrap gap-2 font-semibold">
                            <label
                              htmlFor="email"
                              className="text-[#B51C69] tracking-widest"
                            >
                              EMAIL :
                            </label>
                            <input
                              type="text"
                              id="email"
                              value={
                                index == 0
                                  ? (participant.email = inputs.teamLeadEmail)
                                  : participant.email
                              }
                              disabled={index == 0 ? true : false}
                              onChange={(e) =>
                                handleEmailChange(index, e.target.value)
                              }
                              className="w-full rounded-xl border-b border-[#B51C69] text-white bg-transparent px-2 py-1 focus:border-b max-md:w-full"
                              placeholder="Email"
                            />
                            {teamErrors && teamErrors[index] && (
                              <h1 className="text-xs font-semibold text-red-600">
                                {teamErrors[index].email}
                              </h1>
                            )}
                          </div>

                          {requirement?.map((req:any,index:number)=>{
                            return(
                              <div key={index} className="flex flex-row flex-wrap gap-2 font-semibold">
                              <label
                                htmlFor="riot_id"
                                className="text-[#B51C69] tracking-widest"
                              >
                                {req.toUpperCase()} :
                              </label>
                              <input
                                type="text"
                                id={req.toLowerCase().replace(/ /g, "_")}
                                value={participant[req.toLowerCase().replace(/ /g, "_")] || ""}
                                disabled={index == 0 ? true : false}
                                onChange={(e) =>
                                  handleEmailChange(index, e.target.value)
                                }
                                className="w-full rounded-xl border-b border-[#B51C69] text-white bg-transparent px-2 py-1 focus:border-b max-md:w-full"
                              />
                              {teamErrors && teamErrors[index] && (
                                <h1 className="text-xs font-semibold text-red-600">
                                  {teamErrors[index].email}
                                </h1>
                              )}
                            </div>
                            )
                          })}

                          <div className="flex flex-row flex-wrap gap-2 font-semibold">
                            <label
                              htmlFor="name"
                              className="text-[#B51C69] tracking-widest"
                            >
                              NAME :
                            </label>
                            <input
                              type="text"
                              id="name"
                              disabled={index == 0 ? true : false}
                              value={
                                index == 0
                                  ? (participant.name = inputs.teamLeadName)
                                  : participant.name
                              }
                              onChange={(e) =>
                                handleNameChange(index, e.target.value)
                              }
                              className={`w-full rounded-xl border-b border-[#B51C69] text-white bg-transparent px-2 py-1 focus:border-b max-md:w-full `}
                            />
                            {teamErrors && teamErrors[index] && (
                              <h1 className="text-xs font-semibold text-red-600">
                                {teamErrors[index].name}
                              </h1>
                            )}
                          </div>

                          <div className="flex flex-row flex-wrap gap-2 font-semibold">
                            <label
                              htmlFor="phone"
                              className="text-[#B51C69] tracking-widest"
                            >
                              PHONE :
                            </label>
                            <input
                              type="text"
                              disabled={index == 0 ? true : false}
                              value={
                                index == 0
                                  ? (participant.phone = inputs.teamLeadPhone)
                                  : participant.phone
                              }
                              onChange={(e) =>
                                handlePhoneChange(index, e.target.value)
                              }
                              className={`w-full rounded-xl border-b border-[#B51C69] text-white bg-transparent px-2 py-1 focus:border-b max-md:w-full `}
                            />
                            {teamErrors && teamErrors[index] && (
                              <h1 className="text-xs font-semibold text-red-600">
                                {teamErrors[index].phone}
                              </h1>
                            )}
                          </div>
                        </div>
                      </div>

                      {participants.length > minTeamMember && (
                        <button
                          onClick={() => removeParticipant(index)}
                          className="rounded-full border-2 border-[#B51C69] px-2 py-1 text-xs font-semibold text-[#B51C69] lg:text-sm"
                        >
                          REMOVE
                        </button>
                      )}
                    </div>
                  ))}
                  {participants.length < maxTeamMember && (
                    <button
                      onClick={addParticipant}
                      className="mt-3 rounded-full border-2 border-[#B51C69] bg-regalia  px-5 py-1    font-semibold tracking-widest text-[#B51C69] hover:border-regalia hover:bg-[#B51C69] hover:text-white"
                    >
                      ADD PERSON
                    </button>
                  )}
                </div>
              )}
            </div>


              <div className="flex w-full flex-row flex-wrap items-center justify-between pt-5">
                <button
                  className="mt-3 rounded-full border-2 border-regalia bg-regalia  px-5 py-1    border-[#B51C69] bg-[#B51C69] font-semibold text-white hover:border-regalia hover:bg-black hover:text-[#B51C69]"
                  onClick={onClose}
                >
                  Close
                </button>
                <button
                  disabled={disabled}
                  className={`${
                    disabled
                      ? "border-regalia bg-black text-regalia"
                      : "border-[#B51C69] bg-[#B51C69] font-semibold text-white hover:border-regalia hover:bg-black hover:text-[#B51C69]"
                  } mt-3 rounded-full border-2 px-5   py-1    tracking-widest `} // hover:bg-white hover:text-black
                  onClick={handleSubmit}
                >
                  {disabled ? (
                    <ClipLoader color="#c9a747" size={20} />
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
           
          </div>
          <Toaster position="bottom-right" />
        </div>
      )}
    </>
  );
};

export default EventRegForm;
