import React, { useMemo, useRef, useState } from "react";
import { Box, useDimensions } from "@chakra-ui/react";

export type MemePictureProps = {
  pictureUrl: string;
  texts: {
    content: string;
    x: number;
    y: number;
  }[];
  onUpdateTextPosition?: (index: number, x: number, y: number) => void,
  dataTestId?: string;
};

const REF_WIDTH = 800;
const REF_HEIGHT = 450;
const REF_FONT_SIZE = 36;

export const MemePicture: React.FC<MemePictureProps> = ({
  pictureUrl,
  texts: rawTexts,
  onUpdateTextPosition,
  dataTestId = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(containerRef, true);
  const boxWidth = dimensions?.borderBox.width;

  const { height, fontSize, texts } = useMemo(() => {
    if (!boxWidth) {
      return { height: 0, fontSize: 0, texts: rawTexts };
    }

    return {
      height: (boxWidth / REF_WIDTH) * REF_HEIGHT,
      fontSize: (boxWidth / REF_WIDTH) * REF_FONT_SIZE,
      texts: rawTexts.map((text) => ({
        ...text,
        x: (boxWidth / REF_WIDTH) * text.x,
        y: (boxWidth / REF_WIDTH) * text.y,
      })),
    };
  }, [boxWidth, rawTexts]);

  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const dragStartPos = useRef<{ mouseX: number; mouseY: number; origX: number; origY: number } | null>(null);

  const onMouseDown = (index: number, e: React.MouseEvent) => {
    e.preventDefault();

    setDraggingIndex(index);

    dragStartPos.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      origX: texts[index].x,
      origY: texts[index].y,
    };
  };

  const onMouseMove = (e: MouseEvent) => {
    if (draggingIndex === null || !dragStartPos.current || !containerRef.current) return;

    e.preventDefault();

    const dx = e.clientX - dragStartPos.current.mouseX;
    const dy = e.clientY - dragStartPos.current.mouseY;

    const newX = dragStartPos.current.origX + dx;
    const newY = dragStartPos.current.origY + dy;

    // Ensure we are inside container boundaries
    const containerRect = containerRef.current.getBoundingClientRect();
    const clampedX = Math.min(Math.max(newX, 0), containerRect.width);
    const clampedY = Math.min(Math.max(newY, 0), containerRect.height);

    if (onUpdateTextPosition) {
      // Convert back to reference scale
      const scale = REF_WIDTH / containerRect.width;

      onUpdateTextPosition(
        draggingIndex,
        clampedX * scale,
        clampedY * scale,
      );
    }
  };

  const onMouseUp = () => {
    setDraggingIndex(null);
    dragStartPos.current = null;
  };

  // Attach and detach mousemove/mouseup on document to track drag outside box
  React.useEffect(() => {
    if (draggingIndex !== null) {
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [draggingIndex]);

  return (
    <Box
      width="full"
      height={height}
      ref={containerRef}
      backgroundImage={pictureUrl}
      backgroundColor="gray.100"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backgroundSize="contain"
      overflow="hidden"
      position="relative"
      borderRadius={8}
      data-testid={dataTestId}
    >
      {texts.map((text, index) => (
        <Box
          key={index}
          position="absolute"
          left={text.x}
          top={text.y}
          fontSize={fontSize}
          color="white"
          fontFamily="Impact"
          fontWeight="bold"
          userSelect="none"
          textTransform="uppercase"
          style={{ WebkitTextStroke: "1px black", cursor: "move" }}
          data-testid={`${dataTestId}-text-${index}`}
          onMouseDown={(e) => onMouseDown(index, e)}
          border="1px solid transparent"
          _hover={{ borderColor: 'grey' }}
        >
          {text.content}
        </Box>
      ))}
    </Box>
  );
};
