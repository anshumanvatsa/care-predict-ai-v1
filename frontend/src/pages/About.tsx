import { Header } from "@/components/layout/Header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Users,
  Award,
  Mail,
  Linkedin,
  Target,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

const About = () => {
  const teamMembers = [
    {
      name: "Priyesh Kumar Jha",
      role: "ML and Backend Engineer",
      description:
        "Designed and implemented cutting-edge AI algorithms for predictive analytics of chronic diseases. Moreover, developed a robust backend infrastructure to support the ML models.",
      image: "/avatars/doctor-1.jpg",
    },
    {
      name: "Ayush Dwivedi",
      role: "Frontend Designer",
      description:
        "Designed the user interface and implemented responsive design to ensure optimal user experience.",
      image: "/avatars/engineer-1.jpg",
    },
    {
      name: "Anshuman",
      role: "Data pipelining and Backend",
      description:
        "Implemented data pipelines and aided in the development of the backend infrastructure.",
      image: "/avatars/doctor-2.jpg",
    },
    {
      name: "Atharv Pandey",
      role: "Backend and DB",
      description:
        "In charge of authentication, user management, and database management.",
      image: "/avatars/pm-1.jpg",
    },
  ];

  const features = [
    {
      icon: TrendingUp,
      title: "Advanced ML Models",
      description:
        "State-of-the-art ensemble methods trained on diverse clinical datasets with 89%+ AUROC performance.",
    },
    {
      icon: Shield,
      title: "HIPAA Compliant",
      description:
        "End-to-end encryption, secure processing, and privacy-by-design architecture for healthcare data.",
    },
    {
      icon: Target,
      title: "Clinical Validation",
      description:
        "Extensively tested with leading healthcare systems and validated against real-world clinical outcomes.",
    },
    {
      icon: Zap,
      title: "Real-time Results",
      description:
        "Sub-minute processing times with interpretable results that integrate seamlessly into clinical workflows.",
    },
  ];
  const handleContactSales = () => {
    const subject = encodeURIComponent("CarePredict AI - Sales Inquiry");
    const body = encodeURIComponent(`Hi,

I'm interested in learning more about CarePredict AI for my healthcare organization.

Please contact me to discuss:
- Pricing and licensing options
- Implementation timeline
- Training and support

Best regards`);

    window.open(
      `mailto:sales@example.com?subject=${subject}&body=${body}`,
      "_blank"
    );

    toast({
      title: "Contact initiated",
      description: "We'll get back to you within 24 hours",
    });
  };
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="hero-gradient text-primary-foreground py-24">
        <div className="container text-center">
          {/* <Badge
            className="mb-12 p-12 text-5xl bg-white/20 text-white border-white/30"
            variant="outline"
          >
            About CarePredict AI
          </Badge> */}

          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Transforming Healthcare with AI-Powered Risk Prediction
          </h1>

          <p className="text-xl text-primary-foreground/90 max-w-3xl mx-auto leading-relaxed">
            We empower healthcare providers with cutting-edge artificial
            intelligence to predict patient deterioration, enabling proactive
            care and better outcomes for chronic disease management.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <div className="space-y-4 text-lg text-muted-foreground">
                <p>
                  Healthcare providers face the challenge of identifying at-risk
                  patients before deterioration occurs. Traditional risk
                  assessment methods often lack the precision and timeliness
                  needed for effective intervention.
                </p>
                <p>
                  CarePredict AI bridges this gap by leveraging advanced machine
                  learning to analyze patient data patterns, providing
                  clinicians with actionable insights that enable proactive,
                  personalized care strategies.
                </p>
                <p>
                  Our goal is to reduce preventable hospital readmissions,
                  improve patient outcomes, and support healthcare teams with
                  data-driven decision-making tools.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <Card className="medical-card p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary mb-2">
                  500K+
                </div>
                <p className="text-sm text-muted-foreground">
                  Patients Analyzed
                </p>
              </Card>

              <Card className="medical-card p-6 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-success" />
                </div>
                <div className="text-2xl font-bold text-success mb-2">
                  89.2%
                </div>
                <p className="text-sm text-muted-foreground">Model AUROC</p>
              </Card>

              <Card className="medical-card p-6 text-center">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-accent" />
                </div>
                <div className="text-2xl font-bold text-accent mb-2">50+</div>
                <p className="text-sm text-muted-foreground">
                  Healthcare Systems
                </p>
              </Card>

              <Card className="medical-card p-6 text-center">
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Award className="w-6 h-6 text-warning" />
                </div>
                <div className="text-2xl font-bold text-warning mb-2">25%</div>
                <p className="text-sm text-muted-foreground">
                  Readmission Reduction
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why Choose CarePredict AI
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for healthcare workflows with clinician input
              and evidence-based validation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="medical-card p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Healthcare professionals and AI experts working together to
              improve patient outcomes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="medical-card p-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-primary-foreground" />
                </div>

                <h3 className="font-semibold mb-1">{member.name}</h3>
                <Badge variant="outline" className="mb-3">
                  {member.role}
                </Badge>

                <p className="text-sm text-muted-foreground mb-4">
                  {member.description}
                </p>

                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm">
                    <Mail className="w-3 h-3" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Linkedin className="w-3 h-3" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join leading healthcare organizations using CarePredict AI to
            improve patient outcomes and reduce costs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <a href="/">Start Risk Assessment</a>
            </Button>

            <Button variant="outline" size="lg" onClick={handleContactSales}>
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
