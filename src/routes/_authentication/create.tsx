import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  Icon,
  IconButton,
  Input,
  Textarea,
  VStack,
} from "@chakra-ui/react";
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useAlert } from '../../contexts/alert'
import { useAuthToken } from '../../contexts/authentication'
import { createMeme, Picture, UnauthorizedError } from '../../api'
import { MemeEditor } from "../../components/meme-editor";
import { useMemo, useState } from "react";
import { MemePictureProps } from "../../components/meme-picture";
import { Plus, Trash } from "@phosphor-icons/react";

export const Route = createFileRoute("/_authentication/create")({
  component: CreateMemePage,
});

function CreateMemePage() {
  const token               = useAuthToken()
  const [picture, setPicture] = useState<Picture | null>(null);
  const [texts, setTexts] = useState<MemePictureProps["texts"]>([]);
  const [description, setDescription] = useState("");
  const navigate = useNavigate();
  const { addAlert } = useAlert()

  const handleDrop = (file: File) => {
    setPicture({
      url: URL.createObjectURL(file),
      file,
    });
  };

  const handleAddCaptionButtonClick = () => {
    setTexts([
      ...texts,
      {
        content: `New caption ${texts.length + 1}`,
        x: Math.random() * 400,
        y: Math.random() * 225,
      },
    ]);
  };

  const handleDeleteCaptionButtonClick = (index: number) => {
    setTexts(texts.filter((_, i) => i !== index));
  };

  const memePicture: MemePictureProps | undefined = useMemo(() => {
    if (!picture) {
      return undefined;
    }

    return {
      pictureUrl: picture.url,
      texts,
      onUpdateTextPosition: (index: number, x: number, y: number) => {
        const newTexts = [...texts];
        newTexts[index] = { ...newTexts[index], x, y};
        setTexts(newTexts);
      }
    };
  }, [picture, texts]);

  const handleSubmit = async () => {
    if (!picture) {
      return;
    }

    try {
      await createMeme(token, picture, description, texts);
      await navigate({ to: "/" });
    } catch (err) {
      if (err instanceof UnauthorizedError) {
        addAlert({
          key: 'create meme',
          message: 'Vous devez être connecté pour créer un meme',
          severity: 'warning',
        })

        navigate({ to: "/login" });
      } else {
        addAlert({
          key: 'create meme',
          message: 'Une erreur est survenue lors de la création du meme, veuillez réessayer',
          severity: 'error',
        })
      }
    }
  };

  return (
    <Flex width="full" height="full">
      <Box flexGrow={1} height="full" p={4} overflowY="auto">
        <VStack spacing={5} align="stretch">
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Upload your picture
            </Heading>
            <MemeEditor onDrop={handleDrop} memePicture={memePicture} />
          </Box>
          <Box>
            <Heading as="h2" size="md" mb={2}>
              Describe your meme
            </Heading>
            <Textarea
              placeholder="Type your description here..."
              value={ description }
              onChange={ e => setDescription(e.target.value) }
            />
          </Box>
        </VStack>
      </Box>
      <Flex
        flexDir="column"
        width="30%"
        minW="250"
        height="full"
        boxShadow="lg"
      >
        <Heading as="h2" size="md" mb={2} p={4}>
          Add your captions
        </Heading>
        <Box p={4} flexGrow={1} height={0} overflowY="auto">
          <VStack>
            {texts.map((text, index) => (
              <Flex width="full" key={ index }>
                <Input
                  value={text.content}
                  mr={1}
                  onChange={(e) => {
                    const newTexts = [...texts];
                    newTexts[index].content = e.target.value;
                    setTexts(newTexts);
                  }}
                />
                <IconButton
                  onClick={() => handleDeleteCaptionButtonClick(index)}
                  aria-label="Delete caption"
                  icon={<Icon as={Trash} />}
                />
              </Flex>
            ))}
            <Button
              colorScheme="cyan"
              leftIcon={<Icon as={Plus} />}
              variant="ghost"
              size="sm"
              width="full"
              onClick={handleAddCaptionButtonClick}
              isDisabled={memePicture === undefined}
            >
              Add a caption
            </Button>
          </VStack>
        </Box>
        <HStack p={4}>
          <Button
            as={Link}
            to="/"
            colorScheme="cyan"
            variant="outline"
            size="sm"
            width="full"
          >
            Cancel
          </Button>
          <Button
            colorScheme="cyan"
            size="sm"
            width="full"
            color="white"
            isDisabled={memePicture === undefined}
            onClick={ handleSubmit }
          >
            Submit
          </Button>
        </HStack>
      </Flex>
    </Flex>
  );
}
