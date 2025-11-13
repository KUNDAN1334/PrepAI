// app/dashboard/company-research/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Building2, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function CompanyResearchPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [companyData, setCompanyData] = useState<any>(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a company name',
        variant: 'destructive',
      });
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch('/api/company/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch company data');
      }

      const data = await response.json();
      setCompanyData(data);

      toast({
        title: 'Success!',
        description: 'Company data fetched successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Company Research</h1>
        <p className="text-gray-600 mt-2">
          Research interview experiences, salaries, and company culture
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by company name (e.g., Google, Microsoft)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isSearching ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : companyData ? (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="interviews">Interview Process</TabsTrigger>
            <TabsTrigger value="salaries">Salaries</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Building2 className="h-8 w-8" />
                  <div>
                    <CardTitle className="text-2xl">{companyData.company}</CardTitle>
                    <CardDescription>Company Overview</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Users className="h-6 w-6 text-gray-600" />
                        <div>
                          <p className="text-2xl font-bold">{companyData.metadata.total_posts}</p>
                          <p className="text-sm text-gray-600">Total Posts</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-6 w-6 text-gray-600" />
                        <div>
                          <p className="text-2xl font-bold">
                            {companyData.interview_insights.common_rounds.length}
                          </p>
                          <p className="text-sm text-gray-600">Interview Rounds</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <DollarSign className="h-6 w-6 text-gray-600" />
                        <div>
                          <p className="text-2xl font-bold">{companyData.salary_data.length}</p>
                          <p className="text-sm text-gray-600">Salary Reports</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Recent Discussions</h4>
                  <div className="space-y-3">
                    {companyData.posts.slice(0, 5).map((post: any, index: number) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <h5 className="font-medium mb-2">{post.title}</h5>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.text}</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span>{post.score}</span>
                            <span>{post.comments_count} comments</span>
                            <span>r/{post.subreddit}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interviews">
            <Card>
              <CardHeader>
                <CardTitle>Interview Process Insights</CardTitle>
                <CardDescription>
                  Common interview rounds and difficulty levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              <div>
  <h4 className="font-semibold mb-3">Common Interview Rounds</h4>
  <div className="flex flex-wrap gap-2">
    {companyData.interview_insights.common_rounds
      .filter((round: string, index: number, self: string[]) => 
        self.indexOf(round) === index
      )
      .map((round: string, index: number) => (
        <Badge key={index} variant="outline">
          {round}
        </Badge>
      ))}
  </div>
</div>

                <div>
                  <h4 className="font-semibold mb-3">Difficulty Mentions</h4>
                  <div className="space-y-2">
                    {Object.entries(companyData.interview_insights.difficulty_mentions).map(
                      ([difficulty, count]: [string, any]) => (
                        <div key={difficulty} className="flex items-center gap-3">
                          <span className="w-24 text-sm capitalize">{difficulty}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-black h-2 rounded-full"
                              style={{
                                width: `${(count / Math.max(...Object.values(companyData.interview_insights.difficulty_mentions) as number[])) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="salaries">
            <Card>
              <CardHeader>
                <CardTitle>Salary Data</CardTitle>
                <CardDescription>Reported compensation ranges</CardDescription>
              </CardHeader>
              <CardContent>
                {companyData.salary_data.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No salary data found in recent posts
                  </p>
                ) : (
                  <div className="space-y-3">
                    {companyData.salary_data.map((salary: any, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <p className="font-medium">
                            {salary.currency === 'INR' ? '₹' : '$'}
                            {salary.amount}
                            {salary.unit === 'LPA' ? ' LPA' : ' annual'}
                          </p>
                          <p className="text-sm text-gray-600">{salary.source}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Employee Reviews & Experiences</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {companyData.posts.map((post: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <h5 className="font-semibold mb-2">{post.title}</h5>
                        <p className="text-sm text-gray-700 mb-3">{post.text.substring(0, 300)}...</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>By {post.author}</span>
                          <span>•</span>
                          <span>{new Date(post.created_utc).toLocaleDateString()}</span>
                          <span>•</span>
                          <a
                            href={post.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            View on Reddit
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Search for a Company</h3>
            <p className="text-sm text-gray-600 text-center max-w-md">
              Enter a company name to get interview insights, salary data, and employee
              experiences from Reddit discussions
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
