import { Card, CardContent, IconButton } from "@mui/material";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";


const team = [
  {
    name: "Phạm Quốc Trung",
    role: "Quản lý dự án",
    image: "/dev1.jpg",
    linkedin: "#",
    github: "#"
  },
  {
    name: "Hoàng Thiện Quân",
    role: "Thành viên phát triển",
    image: "/dev1.jpg",
    linkedin: "#",
    github: "#"
  },
  {
    name: "Nguyễn Sinh Hùng",
    role: "Thành viên phát triển",
    image: "/dev1.jpg",
    linkedin: "#",
    github: "#"
  },
  {
    name: "Phạm Quang Đức Anh",
    role: "Thành viên phát triển",
    image: "/dev1.jpg",
    linkedin: "#",
    github: "#"
  },
  {
    name: "Lê Anh Đức",
    role: "Thành viên phát triển",
    image: "/dev1.jpg",
    linkedin: "#",
    github: "#"
  }
];

const AboutUs = () => {
  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-4">
            Hãy gặp đội ngũ của chúng tôi
          </h2>
          <p className="text-lg text-green-800 max-w-xl mx-auto">
            Những nhà phát triển tài năng cống hiến hết mình cho hệ thống quản lý kho thức ăn chăn nuôi.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {team.map((member, index) => (
            <Card 
              key={index} 
              className="overflow-hidden shadow-md border border-gray-200 transition-all"
            >
              <CardContent className="p-0">
                <div className="aspect-square overflow-hidden">
                  <img 
                    src={member.image} 
                    alt={`${member.name} - ${member.role}`}
                    className="w-full h-full object-cover transition-transform duration-300"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-semibold mb-1">{member.name}</h3>
                  <p className="text-gray-500 mb-4">{member.role}</p>
                  <div className="flex justify-center gap-3">
                    <IconButton 
                      href={member.linkedin}
                      aria-label={`${member.name}'s LinkedIn profile`}
                      className="!bg-green-600 !text-white hover:!bg-green-800"
                    >
                      <LinkedInIcon />
                    </IconButton>
                    <IconButton 
                      href={member.github}
                      aria-label={`${member.name}'s GitHub profile`}
                      className="!bg-green-600 !text-white hover:!bg-green-800"
                    >
                      <GitHubIcon />
                    </IconButton>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutUs;
