import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type ContactTemplateProps = {
  readonly name: string;
  readonly email: string;
  readonly message: string;
  readonly phone?: string;
};

export const ContactTemplate = ({
  name,
  email,
  message,
  phone,
}: ContactTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Nuevo correo de {name}</Preview>
      <Body className="bg-zinc-50 font-sans">
        <Container className="mx-auto py-12">
          <Section className="mt-8 rounded-md bg-zinc-200 p-px">
            <Section className="rounded-[5px] bg-white p-8">
              <Text className="mt-0 mb-4 font-semibold text-2xl text-zinc-950">
                Nuevo correo de {name}
              </Text>
              <Text className="m-0 text-zinc-500">
                {name} ({email}) te ha enviado un mensaje:
              </Text>
              {phone && (
                <Text className="m-0 text-zinc-500">Teléfono: {phone}</Text>
              )}
              <Hr className="my-4" />
              <Text className="m-0 text-zinc-500">{message}</Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

const ExampleContactEmail = () => (
  <ContactTemplate
    name="Jane Smith"
    email="jane@example.com"
    message="Hola, ¿cómo puedo comenzar?"
  />
);

export default ExampleContactEmail;
