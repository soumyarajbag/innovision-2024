import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ClipLoader } from "react-spinners";
import FormElement from "./FormElement";
import { clickSound } from "@/utils/functions/clickSound";
import { useUser } from "@/lib/store/user";
import { validateReg } from "@/utils/functions/validateReg";
import { eventReg } from "@/utils/functions/eventReg";
import toast, { Toaster } from "react-hot-toast";
import Compressor from "compressorjs";

const fileTypesByEvent = {
  "efe69592-f939-4c62-bc9f-c3a8529d5d5a":
    "pdf,application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, text/plain,image/*",
  "9cb652d2-5026-473b-b562-0bea0c036009": "pdf,image/*",
  "4506ea8e-c7b5-49dd-a856-60cd96713335": "pdf,image/*",
  "08242c79-6478-478a-ad9b-4ed6d089c02d": "pdf,images/*",
  "a4c6d277-d77e-45ca-9978-ed6e93337057": "video/*",
};

const EventRegForm = ({
  isOpen,
  onClose,
  eventDetails,
  throughPortal,
}: {
  isOpen: boolean;
  onClose: () => void;
  eventDetails: any;
  throughPortal?: boolean;
}) => {
  const router = useRouter();
  const eventId = eventDetails?.id;
  const [disabled, setDisabled] = useState<boolean>(false);
  const [requirement, setRequirement] = useState<any>([]);
  const [maxFiles, setMaxFiles] = useState<number>(1);
  const [totalSubmission, setTotalSubmission] = useState<number>(1);
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
        teamLeadRoll: user.college_roll,
      }));
    }
  }, [user, maxTeamMember]);

  const [participants, setParticipants] = useState<any>([]);
  useEffect(() => {
    if (minTeamMember !== undefined && minTeamMember !== null) {
      const blankParticipants = [];

      for (let i = 0; i < minTeamMember; i++) {
        blankParticipants.push({ phone: "", email: "", name: "", roll: "" });
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

  const [file, setFile] = useState<any>(null);

  useEffect(() => {
    if (file == 0) {
      setFile(null);
    }
  }, [file]);
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | any>
  ) => {
    let selectedFiles =
      maxFiles > 1 ? Array.from(e.target.files) : [e.target.files[0]];

    if (selectedFiles.length > maxFiles) {
      selectedFiles = selectedFiles.slice(0, maxFiles);
    }

    const compressedFiles: any[] = [];

    selectedFiles.forEach((file) => {
      new Compressor(file, {
        quality: 0.6,
        success: (compressedResult: any) => {
          console.log(compressedResult);
          compressedResult.name = file.name;
          compressedFiles.push(compressedResult);

          if (compressedFiles.length === selectedFiles.length) {
            setFile(compressedFiles);
          }
        },
      });
    });
  };

  const handleExtraMainChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInputs((prevInputs: any) => ({
      ...prevInputs,
      extra: {
        ...prevInputs.extra,
        [name]: value,
      },
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].email = value;
    if (index == 0) {
      updatedParticipants[0].email = inputs.teamLeadEmail;
    }
    setParticipants(updatedParticipants);
  };

  const handleRollChange = (index: number, value: string) => {
    const updatedParticipants = [...participants];
    updatedParticipants[index].roll = value;
    if (index == 0) {
      updatedParticipants[0].roll = inputs.teamLeadRoll;
    }
    setParticipants(updatedParticipants);
  };

  const handleExtraChange = (
    participantIndex: number,
    fieldName: string,
    fieldValue: string
  ) => {
    setParticipants((prevParticipants: any) => {
      const updatedParticipants = [...prevParticipants];
      updatedParticipants[participantIndex] = {
        ...updatedParticipants[participantIndex],
        extra: { [fieldName]: fieldValue },
      };
      return updatedParticipants;
    });
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
    setParticipants((prevParticipants: any) => {
      const newParticipant: any = {
        name: "",
        email: "",
        phone: "",
        roll: "",
        extra: {},
      };

      if (eventDetails?.requirements?.length > 0) {
        eventDetails?.requirements.forEach((req: any) => {
          const fieldKey = req.toLowerCase().replace(/ /g, "_");
          newParticipant.extra[fieldKey] = "";
        });
      }

      return [...prevParticipants, newParticipant];
    });
  };

  const removeParticipant = (index: number) => {
    const updatedParticipants = [...participants];
    updatedParticipants.splice(index, 1);
    setParticipants(updatedParticipants);
  };

  const [generalErrors, setGeneralErrors] = useState<any>({});
  const [teamErrors, setTeamErrors] = useState<any>({});
  const [fileSubmission, setFileSubmission] = useState<boolean>(false);
  let teamMemberCountError = "";
  const handleSubmit = async () => {
    clickSound();
    try {
      const res = validateReg(
        inputs,
        participants,
        maxTeamMember,
        requirements,
        file
      );
      if (fileSubmission === false) {
        delete res.errors.file;
      }
      let allExtraFieldsEmpty:boolean = true;
      if (inputs.extra && typeof inputs.extra === 'object') {
        const values: string[] = Object.values(inputs.extra);

        allExtraFieldsEmpty = values.every((value) => value.trim() !== "");
      }
      console.log(allExtraFieldsEmpty);
      const allFieldsEmpty = allExtraFieldsEmpty &&
        Object.values(res.errors).every((value) => value === "") &&
        res.teamErrors.every(
          (participant: any) =>
            participant.name === "" && participant.phone === ""
        );

      if (allFieldsEmpty) {
        setDisabled(true);
        await eventReg(
          inputs,
          participants,
          eventId,
          user,
          fileSubmission,
          file
        );
        toast.success("Registration Successful");
        onClose();
        router.push("/profile");
        setDisabled(false);
      } else {
        setDisabled(false);
        if (res.errors || res.teamErrors) {
          setGeneralErrors(res.errors);
          setTeamErrors(res.teamErrors);
          toast.error("Fill all the fields accurately !");
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
    const script = document.createElement("script");
    script.src = "https://apply.devfolio.co/v2/sdk.js";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const requirements = useMemo(
    () => eventDetails?.requirements || [],
    [eventDetails]
  );

  useEffect(() => {
    setFileSubmission(
      (eventDetails?.file_submission && eventDetails?.file_submission?.file) ||
        false
    );
    setMaxFiles(
      (eventDetails?.file_submission && eventDetails?.file_submission?.max) || 1
    );
    setTotalSubmission(
      (eventDetails?.file_submission && eventDetails?.file_submission?.total) ||
        1
    );
    setRequirement(eventDetails?.requirements);

    if (maxTeamMember === 1) {
      setInputs((prevInputs: any) => {
        const updatedInputs = { ...prevInputs };
        const extra: any = {};

        eventDetails?.requirements?.length > 0 &&
          eventDetails?.requirements.forEach((req: any) => {
            const fieldKey = req.toLowerCase().replace(/ /g, "_");
            extra[fieldKey] = "";
          });

        updatedInputs.extra = extra;
        return updatedInputs;
      });
    }

    setParticipants((prevParticipants: any) => {
      const updatedParticipants = prevParticipants.map((participant: any) => {
        const updatedParticipant = { ...participant };
        const extra: any = {};

        eventDetails?.requirements?.length > 0 &&
          eventDetails?.requirements.forEach((req: any) => {
            const fieldKey = req.toLowerCase().replace(/ /g, "_");
            extra[fieldKey] = "";
          });

        updatedParticipant.extra = extra;
        return updatedParticipant;
      });

      return updatedParticipants;
    });
  }, [eventDetails]);
  console.log(generalErrors);
  return (
    <>
      {isOpen && (
        <div className="fixed  inset-0 z-[50] flex items-center justify-center bg-black bg-opacity-50">
          <div
            className={`rounded-lg border-y-2 border-[#B51C69] bg-body p-4 ${
              throughPortal
                ? "h-[60vh] md:h-[70vh]"
                : maxTeamMember > 1
                ? "h-[70vh] md:h-[60vh]"
                : "h-auto"
            }   flex w-[95%]  flex-col items-start lg:w-[60%] 2xl:w-[50%] lg:px-32 lg:py-8`}
            style={{ background: 'url("/events/Background-img.png")' }}
          >
            <div className="mb-2 flex w-full flex-row items-center justify-between">
              <h2
                id="glow"
                className="text-md font-Chakra_Petch  text-[#B51C69]  font-semibold tracking-widest lg:text-2xl"
              >
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

              {fileSubmission && (
                <div className="flex w-full flex-row flex-wrap text-white items-center gap-2 text-xl">
                  <label
                    htmlFor="file"
                    id="glow"
                    className="font-semibold tracking-widest"
                  >
                    Submission:
                  </label>
                  <input
                    type="file"
                    id="file"
                    accept={
                      fileTypesByEvent[eventId as keyof typeof fileTypesByEvent]
                    }
                    multiple={maxFiles > 1}
                    max={maxFiles}
                    className="bg-transparent font-Chakra_Petch font-semibold tracking-widest text-white"
                    onChange={handleFileChange}
                  />
                  <h1 className="text-xs font-semibold text-red-600">
                    {generalErrors.file}
                  </h1>

                  <div className="flex flex-col w-full text-lg items-center justify-start gap-2">
                    {file &&
                      Array.isArray(file) &&
                      file.length > 0 &&
                      file.map((f: any, index: number) => (
                        <h1
                          key={index}
                          className=" flex flex-row w-full gap-5 font-semibold text-white"
                        >
                          <span>{f.name}</span>
                          <button
                            onClick={() => {
                              setFile((prevFile: any) => {
                                const updatedFile = [...prevFile];
                                updatedFile.splice(index, 1);
                                return updatedFile;
                              });
                              if (file.length == 0) {
                                setFile(null);
                              }
                            }}
                            className="bg-red-500 text-white rounded-xl"
                          >
                            X
                          </button>
                        </h1>
                      ))}
                  </div>
                </div>
              )}

              {maxTeamMember === 1 &&
                requirement?.map((req: any, reqIndex: number) => {
                  return (
                    <div key={reqIndex}>
                      <FormElement
                        type="text"
                        name={req}
                        value={
                          inputs?.extra[req.toLowerCase().replace(/ /g, "_")] ||
                          ""
                        }
                        id={req.toLowerCase().replace(/ /g, "_")}
                        onChange={(e) => {
                          handleExtraMainChange(e);
                        }}
                        width="100%"
                      />
                      <h1 className="text-xs font-semibold text-red-600">
                        {generalErrors[req]}
                      </h1>
                    </div>
                  );
                })}

              {maxTeamMember > 1 && (
                <div className="flex flex-col items-center gap-5">
                  <h1 id="glow" className="font-semibold text-[#B51C69]">
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
                      className="flex flex-row   flex-wrap items-center gap-10 rounded-lg border-2  border-[#B51C69] px-10 py-2 pb-5 text-sm"
                    >
                      <div className="flex flex-col  items-start gap-2">
                        <label
                          htmlFor=""
                          id="glow"
                          className=" text-[#B51C69]  font-semibold tracking-widest"
                        >
                          {(index == 0
                            ? "Team Lead"
                            : `Person ${index + 1}`
                          ).toUpperCase()}
                        </label>

                        <div className="flex flex-col items-start gap-3">
                          <div className="flex flex-row flex-wrap gap-2 font-semibold">
                            <label
                              htmlFor="email"
                              id="glow"
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
                            />
                            {teamErrors && teamErrors[index] && (
                              <h1 className="text-xs font-semibold text-red-600">
                                {teamErrors[index].email}
                              </h1>
                            )}
                          </div>

                          <div className="flex flex-row flex-wrap gap-2 font-semibold">
                            <label
                              htmlFor="email"
                              id="glow"
                              className="text-[#B51C69] tracking-widest"
                            >
                              COLLEGE ROLL :
                            </label>
                            <input
                              type="text"
                              id="email"
                              value={
                                index == 0
                                  ? (participant.roll = inputs.teamLeadRoll)
                                  : participant.roll
                              }
                              disabled={index == 0 ? true : false}
                              onChange={(e) =>
                                handleRollChange(index, e.target.value)
                              }
                              className="w-full rounded-xl border-b border-[#B51C69] text-white bg-transparent px-2 py-1 focus:border-b max-md:w-full"
                            />
                            {teamErrors && teamErrors[index] && (
                              <h1 className="text-xs font-semibold text-red-600">
                                {teamErrors[index].roll}
                              </h1>
                            )}
                          </div>

                          {requirement?.map((req: any, reqIndex: number) => {
                            return (
                              <div
                                key={reqIndex}
                                className="flex flex-row flex-wrap gap-2 font-semibold"
                              >
                                <label
                                  id="glow"
                                  htmlFor={req.toLowerCase().replace(/ /g, "_")}
                                  className="text-[#B51C69] tracking-widest"
                                >
                                  {req.toUpperCase()} :
                                </label>
                                <input
                                  type="text"
                                  id={req.toLowerCase().replace(/ /g, "_")}
                                  value={
                                    participant.extra[
                                      req.toLowerCase().replace(/ /g, "_")
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleExtraChange(
                                      index,
                                      req.toLowerCase().replace(/ /g, "_"),
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded-xl border-b border-[#B51C69] text-white bg-transparent px-2 py-1 focus:border-b max-md:w-full"
                                />
                                {teamErrors && teamErrors[index] && (
                                  <h1 className="text-xs font-semibold text-red-600">
                                    {teamErrors[index].req}
                                  </h1>
                                )}
                              </div>
                            );
                          })}

                          <div className="flex flex-row flex-wrap gap-2 font-semibold">
                            <label
                              htmlFor="name"
                              id="glow"
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
                              id="glow"
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
            )
            {throughPortal && (
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
            )}
          </div>
          <Toaster position="bottom-right" />
        </div>
      )}
    </>
  );
};

export default EventRegForm;
