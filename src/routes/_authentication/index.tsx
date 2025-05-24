import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { createFileRoute } from "@tanstack/react-router";
import {
  Flex,
  StackDivider,
  VStack,
} from "@chakra-ui/react";
import {
  getMemes,
  getUserById,
} from "../../api";
import { InfiniteScroll } from '../../components/infinite-scroll'
import { MemeCard } from '../../components/meme-card'
import { AuthorCacheProvider } from '../../contexts/author'
import { useAuthToken } from "../../contexts/authentication";
import { Loader } from "../../components/loader";
import { jwtDecode } from "jwt-decode";

export const MemeFeedPage: React.FC = () => {
  const token = useAuthToken();

  const {
          data,
          fetchNextPage,
          hasNextPage,
          isFetchingNextPage,
          status,
        } = useInfiniteQuery({
    queryKey: ['memes'],
    queryFn: async ({ pageParam }) => getMemes(token, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);

      if (pages.length < totalPages) {
        return pages.length + 1;
      }

      return undefined;
    },
  })

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      return await getUserById(token, jwtDecode<{ id: string }>(token).id);
    },
  });

  if (status === 'pending') {
    return <Loader data-testid="meme-feed-loader" />
  }

  return (
    <Flex width="full" height="full" justifyContent="center" overflowY="auto">
      <VStack
        p={4}
        width="full"
        maxWidth={800}
        divider={<StackDivider border="gray.200" />}
      >
        <AuthorCacheProvider>
          <InfiniteScroll
            hasNextPage={ hasNextPage }
            isFetchingNextPage={ isFetchingNextPage }
            fetchNextPage={ fetchNextPage }
          >
            {
              data?.pages.flatMap(page =>
                page.results.map(meme => (
                  <MemeCard key={ meme.id } meme={ meme } user={ user! } />
                )),
              )
            }
          </InfiniteScroll>
        </AuthorCacheProvider>
      </VStack>
    </Flex>
  );
};

export const Route = createFileRoute("/_authentication/")({
  component: MemeFeedPage,
});
