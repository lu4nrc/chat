if (!message.fromMe) {
    return (
      /* ++++++++++ Recebidas ++++++++++ */

      <Box
        key={message.id}

      >
        <Box
          display={"flex"}
          width={"100%"}
          alignContent={"center"}
          justifyContent={"center"}
          
        >
          <Typography
            variant="caption"
            color={theme.palette.primary.main}
            
          >
            {renderDailyTimestamps(message, index)}
          </Typography>
        </Box>

        {renderMessageDivider(message, index)}

        <Stack
          key={message.id}
          alignItems={"start"}
          bgcolor={theme.palette.background.paper}
          marginRight={5}
          borderRadius={0.7}
          direction={"row"}
          position={"relative"}
          pr={"32px"}
          minHeight={"38px"}
          marginBottom={1}
          width={"fit-content"}
          maxWidth={{ xs: "100%", md: "75%" }}
          overflow={"hidden"}
          wordWrap="break-word"
        >
          <Stack direction={"column"} px={1} py={0.5}>
            {isGroup && (
              <Typography  color={"primary"} variant="caption">
                {message.contact?.name}
              </Typography>
            )}
            {(message.mediaUrl ||
              message.mediaType === "location" ||
              message.mediaType === "vcard") &&
              checkMessageMedia(message)}
            <Stack
              direction={"column"}
              gap={0.5}
            
            >
              {message.quotedMsg && renderQuotedMessage(message)}
              <Typography
                sx={{
                  
                  textOverflow: "ellipsis",
                  wordWrap: "break-word",
                  paddingLeft: message.quotedMsg ? 2 : 0,
                }}
              >
                <MarkdownWrapper>{message.body}</MarkdownWrapper>
              </Typography>
            </Stack>
          </Stack>

          <Box
            sx={{ position: "absolute", right: 1, top: 0 }}
            id="messageActionsButton"
            disabled={message.isDeleted}
            onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
          >
            <ExpandMore />
          </Box>
          <Typography
            sx={{ position: "absolute", right: 5, bottom: 1 }}
            variant="caption"
            color={"grey"}
          >
            {format(parseISO(message.createdAt), "HH:mm")}
          </Typography>
        </Stack>
      </Box>
      /* ----------- Recebidas ----------- */
    );
  } else {
    return (
      /* ++++++++++ Enviadas ++++++++++ */
      <Box key={message.id}>
        <Box
          display={"flex"}
          alignContent={"center"}
          justifyContent={"center"}
        >
          <Typography
            variant="caption"
            sx={{ color: theme.palette.text.secondary }}
          >
            {renderDailyTimestamps(message, index)}
          </Typography>
        </Box>

        {renderMessageDivider(message, index)}

        <Stack
          key={message.id}
          justifyContent={"end"}
          alignItems={"end"}
          direction={"row"}
        >
          <Stack
            bgcolor={theme.palette.background.paper}
            width={"fit-content"}
            maxWidth={{ xs: "100%", md: "60%" }}
            marginLeft={5}
            borderRadius={0.7}
            direction={"row"}
            position={"relative"}
            pr={"32px"}
            minHeight={"38px"}
            marginBottom={1}
          >
            <Stack
              px={1}
              py={1}
              gap={1}
              alignItems={"flex-start"}
              direction={
                message.mediaType === "application" ? "row" : "column"
              }
            >
              {(message.mediaUrl ||
                message.mediaType === "location" ||
                message.mediaType === "vcard") &&
                checkMessageMedia(message)}
              {message.isDeleted && <Block fontSize="small" />}
              {message.quotedMsg && renderQuotedMessage(message)}

              {message.mediaType === "audio" ||
              message.mediaType === "image" ? null : (
                <Typography
                  style={{ paddingLeft: message.quotedMsg ? 8 : 0 }}
                >
                  <MarkdownWrapper>{message.body}</MarkdownWrapper>
                </Typography>
              )}
            </Stack>

            <Stack
              pr={1}
              direction={"column"}
              justifyContent={"space-between"}
              alignItems={"end"}
            >
              <Box
                sx={{ position: "absolute", right: 1, top: 0 }}
                id="messageActionsButton"
                disabled={message.isDeleted}
                onClick={(e) => handleOpenMessageOptionsMenu(e, message)}
              >
                <ExpandMore />
              </Box>

              <Typography
                sx={{ position: "absolute", right: 5, bottom: 1 }}
                variant="caption"
                color={theme.palette.text.secondary}
              >
                {format(parseISO(message.createdAt), "HH:mm")}
              </Typography>
            </Stack>
          </Stack>
          {renderMessageAck(message)}
        </Stack>
      </Box>
      /* ----------- Recebidas ----------- */
    );
  }