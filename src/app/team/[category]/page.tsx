import TeamCard from "@/components/team/TeamCard";
import TeamWrapper from "@/components/team/TeamWrapper";
import { teams } from "@/utils/constants/team";
import React from "react";

type Params = {
  params: {
    category: string;
  };
};

const page = ({ params: { category } }: Params) => {
  const team = teams.filter((team) => team.id === category)[0];

  return (
    <div
      style={{ backgroundImage: "url('/events/Background-img.png')" }}
      className="bg-cover w-full h-full"
    >
      <TeamWrapper>
        <div className="oveflow-x-hidden flex min-h-[60vh] flex-col items-center gap-10">
          <div className="mt-5 flex flex-col items-center  justify-center gap-5">
            <h1 className="text-center text-3xl font-bold font-Chakra_Petch text-white">
              {team?.category}
            </h1>
            <div className="mt-5 flex flex-row flex-wrap justify-center gap-10 md:gap-32">
              {team?.members.map((member, index) => (
                <div key={index}>
                  <TeamCard
                    name={member.name}
                    imageUrl={member.image}
                    role={member.role}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </TeamWrapper>
    </div>
  );
};

export default page;
